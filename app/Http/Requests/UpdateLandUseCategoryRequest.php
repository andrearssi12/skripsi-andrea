<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLandUseCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $category = $this->route('landUseCategory')
            ?? $this->route('land_use_category')
            ?? $this->route('category');

        $categoryId = $category instanceof \App\Models\LandUseCategory
            ? $category->id
            : $category;

        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('land_use_categories', 'name')->ignore($categoryId)],
            'color' => ['required', 'string', 'max:30'],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.unique' => 'Nama kategori sudah ada.',
            'color.required' => 'Warna kategori wajib ditentukan.',
        ];
    }
}
