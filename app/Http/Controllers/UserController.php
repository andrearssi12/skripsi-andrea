<?php

namespace App\Http\Controllers;

use App\Http\Requests\BatchStoreUserRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $role = $request->query('role');

        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role && in_array($role, ['admin', 'pengurus', 'user'], true)) {
            $query->where('role', $role);
        }

        $users = $query->latest('id')
            ->paginate(12)
            ->withQueryString();

        // Statistics counts
        $stats = [
            'total' => User::count(),
            'admin' => User::where('role', 'admin')->count(),
            'pengurus' => User::where('role', 'pengurus')->count(),
            'user' => User::where('role', 'user')->count(),
        ];

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => $this->getAvailableRoles(),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $data['email_verified_at'] = now();

        $user = User::create($data);

        ActivityLogService::log(
            'create',
            'user',
            "Menambahkan pengguna baru: {$user->name} ({$user->email}) sebagai {$user->role}",
            $user->id
        );

        return redirect()->route('users.index')
            ->with('success', "Pengguna {$user->name} ({$user->role}) berhasil ditambahkan.");
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at?->toISOString(),
            ],
            'roles' => $this->getAvailableRoles(),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        // Prevent admin from demoting their own role
        if ($request->user()->id === $user->id && $data['role'] !== 'admin') {
            return back()->with('error', 'Anda tidak dapat mengubah role akun Administrator Anda sendiri.');
        }

        // If password is not provided or empty, remove it from update data
        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        ActivityLogService::log(
            'update',
            'user',
            "Memperbarui data pengguna: {$user->name} ({$user->email})",
            $user->id
        );

        return redirect()->route('users.index')
            ->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Prevent deleting own account
        if ($request->user()->id === $user->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
        }

        // Prevent deleting the last administrator
        if ($user->isAdmin() && User::where('role', 'admin')->count() <= 1) {
            return back()->with('error', 'Tidak dapat menghapus akun karena ini merupakan satu-satunya Administrator pada sistem.');
        }

        $id = $user->id;
        $name = $user->name;
        $role = $user->role;

        $user->delete();

        ActivityLogService::log(
            'delete',
            'user',
            "Menghapus pengguna: {$name} (Role: {$role})",
            $id
        );

        return redirect()->route('users.index')
            ->with('success', "Pengguna {$name} berhasil dihapus.");
    }

    /**
     * Show the batch user creation page.
     */
    public function batchCreate(): Response
    {
        return Inertia::render('Users/BatchCreate', [
            'roles' => $this->getAvailableRoles(),
        ]);
    }

    /**
     * Process batch user creation (from interactive table or CSV upload).
     */
    public function batchStore(BatchStoreUserRequest $request): RedirectResponse
    {
        $rows = [];

        // 1. Check if CSV file was uploaded
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $content = file_get_contents($file->getRealPath());
            $rows = $this->parseCsvContent($content);
        }
        // 2. Check if CSV text was pasted
        elseif ($request->filled('csv_text')) {
            $rows = $this->parseCsvContent($request->input('csv_text'));
        }
        // 3. Check if users array from interactive table was submitted
        elseif (is_array($request->input('users'))) {
            $rows = $request->input('users');
        }

        if (empty($rows)) {
            return back()->with('error', 'Tidak ada data pengguna yang valid untuk diproses.');
        }

        $createdCount = 0;
        $skippedErrors = [];
        $existingEmails = User::pluck('email')->map(fn ($e) => strtolower(trim($e)))->all();
        $processedEmailsInBatch = [];

        DB::beginTransaction();

        try {
            foreach ($rows as $index => $row) {
                $rowNum = $index + 1;
                $name = trim($row['name'] ?? '');
                $email = strtolower(trim($row['email'] ?? ''));
                $password = trim($row['password'] ?? '');
                $role = strtolower(trim($row['role'] ?? 'user'));

                // Normalize role alias
                if (in_array($role, ['civitas', 'mahasiswa', 'dosen', 'user'], true)) {
                    $role = 'user';
                } elseif (in_array($role, ['pengurus', 'pengurus_lingkungan', 'staff'], true)) {
                    $role = 'pengurus';
                } elseif ($role === 'admin') {
                    $role = 'admin';
                } else {
                    $role = 'user';
                }

                if (empty($name) || empty($email)) {
                    $skippedErrors[] = "Baris #{$rowNum}: Nama dan Email tidak boleh kosong.";
                    continue;
                }

                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $skippedErrors[] = "Baris #{$rowNum} ({$email}): Format email tidak valid.";
                    continue;
                }

                if (in_array($email, $existingEmails, true) || in_array($email, $processedEmailsInBatch, true)) {
                    $skippedErrors[] = "Baris #{$rowNum} ({$email}): Email sudah terdaftar sebelumnya (dilewati).";
                    continue;
                }

                if (empty($password) || strlen($password) < 8) {
                    $password = 'password123'; // Default fallback password if empty or < 8
                }

                User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'role' => $role,
                    'email_verified_at' => now(),
                ]);

                $processedEmailsInBatch[] = $email;
                $createdCount++;
            }

            DB::commit();

            ActivityLogService::log(
                'create',
                'user',
                "Pembuatan pengguna secara batch: {$createdCount} pengguna berhasil dibuat"
            );

            $msg = "Berhasil membuat {$createdCount} pengguna baru.";
            if (!empty($skippedErrors)) {
                $skipSummary = implode(' ', array_slice($skippedErrors, 0, 3));
                if (count($skippedErrors) > 3) {
                    $skipSummary .= ' dan ' . (count($skippedErrors) - 3) . ' baris lainnya.';
                }
                $msg .= " Catatan: " . $skipSummary;
            }

            return redirect()->route('users.index')->with('success', $msg);
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memproses pembuatan user batch: ' . $e->getMessage());
        }
    }

    /**
     * Download CSV template for batch user import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_users_green_campus.csv"',
        ];

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM
            fputs($handle, "\xEF\xBB\xBF");

            // CSV Header
            fputcsv($handle, ['name', 'email', 'password', 'role']);

            // Sample rows
            fputcsv($handle, ['Dr. Budi Santoso', 'budi.santoso@uad.ac.id', 'password123', 'admin']);
            fputcsv($handle, ['Siti Rahmawati (Tim Lingkungan)', 'siti.lingkungan@uad.ac.id', 'password123', 'pengurus']);
            fputcsv($handle, ['Ahmad Fauzi (Mahasiswa)', 'ahmad.fauzi@webmail.uad.ac.id', 'password123', 'user']);

            fclose($handle);
        }, 'template_users_green_campus.csv', $headers);
    }

    /**
     * Helper to parse CSV string into associative rows.
     */
    protected function parseCsvContent(string $content): array
    {
        // Strip BOM
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);
        $lines = preg_split("/\r\n|\n|\r/", trim($content));
        if (empty($lines)) return [];

        $headers = null;
        $rows = [];

        foreach ($lines as $line) {
            if (trim($line) === '') continue;

            $data = str_getcsv($line);
            if (!$headers) {
                // Normalize header row
                $headers = array_map(fn ($h) => strtolower(trim($h)), $data);
                continue;
            }

            if (count($data) >= 2) {
                $row = [];
                foreach ($headers as $i => $headerKey) {
                    $row[$headerKey] = $data[$i] ?? '';
                }
                $rows[] = $row;
            }
        }

        return $rows;
    }

    /**
     * Available roles and their descriptions.
     */
    protected function getAvailableRoles(): array
    {
        return [
            [
                'value' => 'admin',
                'label' => 'Administrator',
                'badge' => 'badge-indigo',
                'description' => 'Akses penuh ke semua fitur manajemen sistem, spasial data, konfigurasi, dan pengguna.',
            ],
            [
                'value' => 'pengurus',
                'label' => 'Pengurus Lingkungan Kampus',
                'badge' => 'badge-amber',
                'description' => 'Menerima dan mengelola seluruh laporan/feedback civitas, serta dapat mengubah status laporan menjadi Diproses atau Selesai.',
            ],
            [
                'value' => 'user',
                'label' => 'Civitas Academica (User Biasa)',
                'badge' => 'badge-emerald',
                'description' => 'Dosen, mahasiswa, atau staf yang dapat memantau peta kawasan hijau dan mengirim laporan/feedback.',
            ],
        ];
    }
}
