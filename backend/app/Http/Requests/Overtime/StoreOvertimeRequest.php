<?php
namespace App\Http\Requests\Overtime;

use Illuminate\Foundation\Http\FormRequest;

class StoreOvertimeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'overtime_date' => ['required','date','after_or_equal:today'],
            'start_time'    => ['required','date_format:H:i'],
            'end_time'      => ['required','date_format:H:i','after:start_time'],
            'reason'        => ['required','string','min:10','max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'overtime_date.after_or_equal' => 'Tanggal lembur tidak boleh di masa lalu',
            'end_time.after'               => 'Jam selesai harus lebih dari jam mulai',
            'reason.min'                   => 'Alasan lembur minimal 10 karakter',
        ];
    }
}
