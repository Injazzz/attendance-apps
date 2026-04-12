<?php
namespace App\Http\Requests\Report;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportReportRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'interval'    => ['required', Rule::in(['daily','weekly','monthly','yearly'])],
            'start_date'  => ['required', 'date'],
            'end_date'    => ['required', 'date', 'after_or_equal:start_date'],
            'site_id'     => ['nullable', 'exists:company_sites,id'],
            'dept_id'     => ['nullable', 'exists:departments,id'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'format'      => ['nullable', Rule::in(['xlsx','csv'])],
            'status'      => ['nullable', Rule::in(['present','late','absent','half_day','leave','sick'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Set tanggal otomatis berdasarkan interval
        if ($this->interval && !$this->start_date) {
            $this->merge(match($this->interval) {
                'daily'   => ['start_date' => today()->toDateString(), 'end_date' => today()->toDateString()],
                'weekly'  => ['start_date' => now()->startOfWeek()->toDateString(), 'end_date' => now()->endOfWeek()->toDateString()],
                'monthly' => ['start_date' => now()->startOfMonth()->toDateString(), 'end_date' => now()->endOfMonth()->toDateString()],
                'yearly'  => ['start_date' => now()->startOfYear()->toDateString(), 'end_date' => now()->endOfYear()->toDateString()],
            });
        }
    }
}
