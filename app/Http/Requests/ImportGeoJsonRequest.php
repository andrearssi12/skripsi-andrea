<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportGeoJsonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'campus_id' => ['required', 'exists:campuses,id'],
            'default_category_id' => ['required', 'exists:land_use_categories,id'],
            'default_green_status' => ['required', 'in:Green Area,Vegetasi Non-RTH,Non-Green Area'],
            'file' => ['required', 'file', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'campus_id.required' => 'Kampus tujuan import wajib dipilih.',
            'default_category_id.required' => 'Kategori default wajib dipilih.',
            'file.required' => 'File GeoJSON wajib diunggah.',
            'file.max' => 'Ukuran file GeoJSON maksimal 10 MB.',
        ];
    }
}
