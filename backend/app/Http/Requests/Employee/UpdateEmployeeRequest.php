<?php
namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'full_name'      => ['sometimes','string','max:100'],
            'email'          => ['sometimes','email', Rule::unique('employees','email')->ignore($id)],
            'phone'          => ['nullable','string','max:15'],
            'id_card'        => ['nullable','string','max:50'],
            'npwp'           => ['nullable','string','max:25'],
            'birthplace'     => ['nullable','string','max:50'],
            'birthdate'      => ['nullable','date','before:today'],
            'gender'         => ['sometimes', Rule::in(['male','female'])],
            'marital_status' => ['sometimes', Rule::in(['single','married','divorced','widowed'])],
            'tax_status'     => ['sometimes', Rule::in(['TK0','TK1','TK2','TK3','K0','K1','K2','K3'])],
            'department_id'  => ['sometimes','exists:departments,id'],
            'position_id'    => ['sometimes','exists:positions,id'],
            'site_id'        => ['nullable','exists:company_sites,id'],
            'hire_date'      => ['sometimes','date'],
            'employment_type' => ['sometimes', Rule::in(['permanent','contract','probation','outsource','daily_worker'])],
            'status'         => ['sometimes', Rule::in(['active','inactive','resigned','terminated'])],
            'photo'          => ['nullable','image','mimes:jpg,jpeg,png','max:2048'],
        ];
    }
}
