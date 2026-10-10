<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeedbackStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageFeedback() ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:Menunggu,Diproses,Selesai'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status feedback wajib dipilih.',
            'status.in' => 'Status harus salah satu dari: Menunggu, Diproses, Selesai.',
        ];
    }
}
