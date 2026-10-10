<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeedbackRequest;
use App\Http\Requests\UpdateFeedbackStatusRequest;
use App\Models\Feedback;
use App\Models\FeedbackHistory;
use App\Models\LandUse;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isManager = $user->canManageFeedback();

        $status = $request->query('status');
        $search = $request->query('search');

        // User biasa hanya bisa melihat feedback miliknya sendiri
        // Admin/Pengurus bisa switch antara all dan my
        if ($isManager) {
            $scope = $request->query('scope', 'all');
        } else {
            $scope = 'my'; // paksa selalu "my" untuk user biasa
        }

        $query = Feedback::with(['user', 'landUse.campus']);

        if ($scope === 'my') {
            $query->where('user_id', $user->id);
        }

        $myCount = Feedback::where('user_id', $user->id)->count();
        $allCount = $isManager ? Feedback::count() : $myCount;

        $feedback = $query
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Feedback/Index', [
            'feedback' => $feedback,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'scope'  => $scope,
            ],
            'counts' => [
                'all' => $allCount,
                'my'  => $myCount,
            ],
            'isAdmin'    => $user->isAdmin(),
            'canManage'  => $isManager,
        ]);
    }

    public function create(Request $request): Response
    {
        $landUses = LandUse::select('id', 'name', 'code', 'campus_id')->with('campus:id,name')->get();
        $selectedLandUseId = $request->query('land_use_id');

        return Inertia::render('Feedback/Create', [
            'landUses'          => $landUses,
            'selectedLandUseId' => $selectedLandUseId ? (int) $selectedLandUseId : null,
        ]);
    }

    public function store(StoreFeedbackRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['status']  = 'Menunggu';

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('feedback_images', 'public');
            $data['image'] = $path;
        }

        $feedback = Feedback::create($data);

        ActivityLogService::log(
            'create',
            'feedback',
            "Pengguna mengirimkan feedback '{$feedback->title}'",
            $feedback->id
        );

        return redirect()->route('feedback.index')
            ->with('success', 'Laporan/feedback Anda berhasil dikirimkan dan menunggu peninjauan.');
    }

    public function show(Feedback $feedback, Request $request): Response
    {
        $feedback->load(['user', 'landUse.campus', 'landUse.category']);

        $user      = $request->user();
        $isOwner   = $user && $feedback->user_id === $user->id;
        $isAdmin   = $user && $user->isAdmin();
        $canManage = $user && $user->canManageFeedback();

        // User biasa yang bukan pemilik tidak boleh melihat feedback orang lain
        if (!$isOwner && !$canManage) {
            abort(403, 'Anda tidak memiliki akses untuk melihat laporan ini.');
        }

        return Inertia::render('Feedback/Show', [
            'feedback'  => $feedback,
            'isOwner'   => $isOwner,
            'isAdmin'   => $isAdmin,
            'canManage' => $canManage,
        ]);
    }

    public function updateStatus(UpdateFeedbackStatusRequest $request, Feedback $feedback): RedirectResponse
    {
        $oldStatus = $feedback->status;
        $newStatus = $request->validated('status');

        $feedback->update(['status' => $newStatus]);

        // Catat riwayat perubahan status
        FeedbackHistory::create([
            'feedback_id'    => $feedback->id,
            'user_id'        => $feedback->user_id,
            'actor_id'       => $request->user()->id,
            'feedback_title' => $feedback->title,
            'action'         => 'status_changed',
            'old_status'     => $oldStatus,
            'new_status'     => $newStatus,
            'created_at'     => now(),
        ]);

        ActivityLogService::log(
            'update',
            'feedback',
            "Mengubah status feedback #{$feedback->id} dari '{$oldStatus}' menjadi '{$newStatus}'",
            $feedback->id
        );

        return back()->with('success', "Status feedback berhasil diubah menjadi {$newStatus}.");
    }

    public function destroy(Feedback $feedback, Request $request): RedirectResponse
    {
        if (!$request->user()->isAdmin()) {
            abort(403, 'Hanya Administrator yang dapat menghapus feedback.');
        }

        // Catat riwayat penghapusan sebelum data dihapus
        FeedbackHistory::create([
            'feedback_id'    => null, // set null karena akan dihapus
            'user_id'        => $feedback->user_id,
            'actor_id'       => $request->user()->id,
            'feedback_title' => $feedback->title,
            'action'         => 'deleted',
            'old_status'     => $feedback->status,
            'new_status'     => null,
            'created_at'     => now(),
        ]);

        if ($feedback->image && Storage::disk('public')->exists($feedback->image)) {
            Storage::disk('public')->delete($feedback->image);
        }

        $id    = $feedback->id;
        $title = $feedback->title;
        $feedback->delete();

        ActivityLogService::log(
            'delete',
            'feedback',
            "Menghapus data feedback #{$id} ({$title})",
            $id
        );

        return redirect()->route('feedback.index')
            ->with('success', 'Feedback berhasil dihapus.');
    }
}
