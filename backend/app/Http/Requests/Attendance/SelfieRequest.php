<?php
namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class SelfieRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'photo'         => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:5120'], // max 5MB
            'gps'           => ['required', 'array'],
            'gps.latitude'  => ['required', 'numeric', 'between:-90,90'],
            'gps.longitude' => ['required', 'numeric', 'between:-180,180'],
            'gps.accuracy'  => ['nullable', 'numeric'],
            'device_info'   => ['required', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'photo.required'    => 'Foto selfie wajib diupload',
            'photo.image'       => 'File harus berupa gambar',
            'photo.max'         => 'Ukuran foto maksimal 5MB',
            'gps.required'      => 'GPS diperlukan untuk absensi proyek',
        ];
    }
}
