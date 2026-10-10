<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLandUseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'campus_id' => ['required', 'exists:campuses,id'],
            'category_id' => ['required', 'exists:land_use_categories,id'],
            'parent_id' => ['nullable', 'exists:land_uses,id'],
            'code' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'area_size' => ['required', 'numeric', 'min:0.01'],
            'green_status' => ['required', 'in:Green Area,Vegetasi Non-RTH,Non-Green Area'],
            'condition' => ['required', 'in:Baik,Sedang,Kurang'],
            'geometry' => ['required'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'campus_id.required' => 'Kampus wajib dipilih.',
            'category_id.required' => 'Kategori lahan wajib dipilih.',
            'name.required' => 'Nama objek lahan wajib diisi.',
            'area_size.required' => 'Luas objek lahan wajib diisi.',
            'area_size.min' => 'Luas objek tidak boleh bernilai 0 atau negatif.',
            'green_status.required' => 'Status Green Area wajib ditentukan.',
            'condition.required' => 'Kondisi objek wajib ditentukan.',
            'geometry.required' => 'Data polygon (geometry) GeoJSON wajib diisi.',
        ];
    }
}
