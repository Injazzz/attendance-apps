<?php
namespace App\Http\Requests\QrDisplay;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQrDisplayRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'site_id'       => ['required','exists:company_sites,id'],
            'display_name'  => ['required','string','max:100'],
            'location'      => ['nullable','string','max:200'],
            'department_id' => ['nullable','exists:departments,id'],
            'qr_type'       => ['required', Rule::in(['check_in','check_out'])],
            'refresh_mode'  => ['required', Rule::in(['time_based','scan_based'])],
            'time_interval' => ['required_if:refresh_mode,time_based','integer','min:10','max:3600'],
            'max_scans'     => ['required_if:refresh_mode,scan_based','integer','min:1'],
        ];
    }
}
