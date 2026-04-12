<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'login'              => ['required', 'string', 'min:3', 'max:100'],
            'password'           => ['required', 'string', 'min:6'],
            'device_fingerprint' => ['required', 'string', 'max:255'],
            'device_info'        => ['required', 'array'],
            'device_info.userAgent'  => ['required', 'string'],
            'device_info.platform'   => ['nullable', 'string'],
            'device_info.screenSize' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'login.required'             => 'Username atau email wajib diisi',
            'password.required'          => 'Password wajib diisi',
            'device_fingerprint.required' => 'Informasi perangkat tidak ditemukan',
        ];
    }
}
