<?php
namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class QrScanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'session_token' => ['required', 'string', 'size:64'],
            // GPS adalah optional untuk token-based QR (tidak selalu ada akses lokasi)
            'gps'           => ['nullable', 'array'],
            'gps.latitude'  => ['nullable', 'numeric', 'between:-90,90'],
            'gps.longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'gps.accuracy'  => ['nullable', 'numeric', 'min:0'],
            'device_info'   => ['required', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'session_token.required'  => 'Token QR tidak valid',
            'gps.latitude.between'    => 'Koordinat GPS tidak valid',
            'gps.longitude.between'   => 'Koordinat GPS tidak valid',
        ];
    }
}
