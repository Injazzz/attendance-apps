<?php
namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_code'   => ['required', 'string', 'max:20', 'unique:employees,employee_code'],
            'full_name'       => ['required', 'string', 'max:100'],
            'email'           => ['required', 'email', 'max:100', 'unique:employees,email'],
            'phone'           => ['nullable', 'string', 'max:15'],
            'id_card'         => ['nullable', 'string', 'max:50'],
            'npwp'            => ['nullable', 'string', 'max:25'],
            'birthplace'      => ['nullable', 'string', 'max:50'],
            'birthdate'       => ['nullable', 'date', 'before:today'],
            'gender'          => ['required', Rule::in(['male', 'female'])],
            'marital_status'  => ['required', Rule::in(['single','married','divorced','widowed'])],
            'tax_status'      => ['required', Rule::in(['TK0','TK1','TK2','TK3','K0','K1','K2','K3'])],
            'department_id'   => ['required', 'exists:departments,id'],
            'position_id'     => ['required', 'exists:positions,id'],
            'site_id'         => ['nullable', 'exists:company_sites,id'],
            'hire_date'       => ['required', 'date'],
            'employment_type' => ['required', Rule::in(['permanent','contract','probation','outsource','daily_worker'])],
            'status'          => ['required', Rule::in(['active','inactive','resigned','terminated'])],
            'photo'           => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],

            // Data akun user sekaligus
            'username'        => ['required', 'string', 'min:3', 'max:50', 'unique:users,username'],
            'password'        => ['required', 'string', 'min:8', 'confirmed'],
            'role'            => ['required', Rule::in(['hrd','finance','project_manager','supervisor','employee'])],
        ];
    }

    public function messages(): array
    {
        return [
            'employee_code.unique' => 'NIK karyawan sudah digunakan',
            'email.unique'         => 'Email sudah terdaftar',
            'username.unique'      => 'Username sudah digunakan',
            'password.confirmed'   => 'Konfirmasi password tidak cocok',
            'password.min'         => 'Password minimal 8 karakter',
            'birthdate.before'     => 'Tanggal lahir tidak valid',
        ];
    }
}
