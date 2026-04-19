<?php

namespace App\Http\Requests\Overtime;

use Illuminate\Foundation\Http\FormRequest;

class RejectOvertimeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Alasan penolakan lembur wajib diisi',
            'reason.string'   => 'Alasan penolakan harus berupa teks',
            'reason.min'      => 'Alasan penolakan minimal 10 karakter',
            'reason.max'      => 'Alasan penolakan maksimal 500 karakter',
        ];
    }
}
