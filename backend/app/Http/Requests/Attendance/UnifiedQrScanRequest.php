<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Unified QR Scan Request
 * All employees must use QR codes containing employee_id and type (department|site)
 */
class UnifiedQrScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // QR payload as string (JSON, base64-encoded JSON, or encrypted)
            'qr_data'           => ['required', 'string', 'min:10', 'max:1000'],

            // GPS coordinates (required for site attendance/location validation)
            'gps'               => ['required', 'array'],
            'gps.latitude'      => ['required', 'numeric', 'between:-90,90'],
            'gps.longitude'     => ['required', 'numeric', 'between:-180,180'],
            'gps.accuracy'      => ['nullable', 'numeric', 'min:0'],

            // Device information for audit trail
            'device_info'       => ['required', 'array'],
            'device_info.user_agent'  => ['nullable', 'string', 'max:500'],
            'device_info.ip'    => ['nullable', 'ip'],
            'device_info.model' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'qr_data.required'  => 'QR Code data diperlukan',
            'qr_data.string'    => 'QR Code harus berupa teks',
            'qr_data.min'       => 'QR Code tidak valid (terlalu pendek)',
            'qr_data.max'       => 'QR Code tidak valid (terlalu panjang)',

            'gps.required'      => 'Data GPS diperlukan',
            'gps.array'         => 'GPS harus berupa objek dengan latitude dan longitude',
            'gps.latitude.required'    => 'Latitude diperlukan',
            'gps.latitude.numeric'     => 'Latitude harus berupa angka',
            'gps.latitude.between'     => 'Latitude tidak valid (-90 sampai 90)',
            'gps.longitude.required'   => 'Longitude diperlukan',
            'gps.longitude.numeric'    => 'Longitude harus berupa angka',
            'gps.longitude.between'    => 'Longitude tidak valid (-180 sampai 180)',
            'gps.accuracy.numeric'     => 'Accuracy harus berupa angka',

            'device_info.required'     => 'Informasi perangkat diperlukan',
            'device_info.array'        => 'Device info harus berupa objek',
        ];
    }
}
