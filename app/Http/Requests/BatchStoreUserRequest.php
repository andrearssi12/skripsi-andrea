<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BatchStoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        // Support either multi-row table input or file/text CSV upload
        return [
            'mode' => ['nullable', 'string', 'in:table,csv_file,csv_text'],
            'users' => ['nullable', 'array'],
            'users.*.name' => ['required_with:users', 'string', 'max:255'],
            'users.*.email' => ['required_with:users', 'string', 'email', 'max:255'],
            'users.*.password' => ['required_with:users', 'string', 'min:8'],
            'users.*.role' => ['required_with:users', 'string', 'in:admin,pengurus,user'],
            'file' => ['nullable', 'file', 'mimes:csv,txt'],
            'csv_text' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'users.*.name.required_with' => 'Nama pengguna di setiap baris wajib diisi.',
            'users.*.email.required_with' => 'Email di setiap baris wajib diisi.',
            'users.*.email.email' => 'Format email pada daftar pengguna tidak valid.',
            'users.*.password.required_with' => 'Password di setiap baris wajib diisi.',
            'users.*.password.min' => 'Password minimal terdiri dari 8 karakter.',
            'users.*.role.in' => 'Role pengguna harus salah satu dari: admin, pengurus, atau user.',
            'file.mimes' => 'Berkas harus bertipe CSV (.csv).',
        ];
    }
}
