<?php
namespace App\Http\Requests\Report;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttendanceReportRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'start_date'  => ['required', 'date', 'before_or_equal:end_date'],
            'end_date'    => ['required', 'date', 'after_or_equal:start_date'],
            'site_id'     => ['nullable', 'exists:company_sites,id'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'dept_id'     => ['nullable', 'exists:departments,id'],
            'status'      => ['nullable', Rule::in(['present', 'late', 'absent', 'half_day', 'leave', 'sick', 'business_trip'])],
            'per_page'    => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'Tanggal mulai wajib diisi',
            'start_date.date' => 'Tanggal mulai harus format tanggal yang valid',
            'end_date.required' => 'Tanggal akhir wajib diisi',
            'end_date.date' => 'Tanggal akhir harus format tanggal yang valid',
            'end_date.after_or_equal' => 'Tanggal akhir harus lebih besar atau sama dengan tanggal mulai',
            'site_id.exists' => 'Site yang dipilih tidak valid',
            'employee_id.exists' => 'Employee yang dipilih tidak valid',
            'dept_id.exists' => 'Department yang dipilih tidak valid',
        ];
    }
}
