<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCampusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $campus = $this->route('campus') ?? $this->route('campuses');
        $campusId = $campus instanceof \App\Models\Campus
            ? $campus->id
            : $campus;

        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('campuses', 'code')->ignore($campusId)],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'total_area' => ['required', 'numeric', 'min:0.01'],
            'boundary_geometry' => ['nullable'],  // accept string JSON or array
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
