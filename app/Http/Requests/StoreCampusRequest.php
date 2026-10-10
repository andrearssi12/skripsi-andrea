<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:campuses,code'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'total_area' => ['required', 'numeric', 'min:0.01'],
            'boundary_geometry' => ['nullable'],  // accept string JSON from draw tool or array
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Kode kampus wajib diisi.',
            'code.unique' => 'Kode kampus sudah digunakan.',
            'name.required' => 'Nama kampus wajib diisi.',
            'total_area.required' => 'Luas kampus wajib diisi.',
            'total_area.min' => 'Luas kampus harus lebih besar dari 0.',
        ];
    }
}
