<?php
namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('employee');
        return [
            'full_name'      => ['sometimes','string','max:100'],
            'email'          => ['sometimes','email', Rule::unique('employees','email')->ignore($id)],
            'phone'          => ['nullable','string','max:15'],
            'department_id'  => ['sometimes','exists:departments,id'],
            'position_id'    => ['sometimes','exists:positions,id'],
            'site_id'        => ['nullable','exists:company_sites,id'],
            'status'         => ['sometimes', Rule::in(['active','inactive','resigned','terminated'])],
            'photo'          => ['nullable','image','mimes:jpg,jpeg,png','max:2048'],
        ];
    }
}
