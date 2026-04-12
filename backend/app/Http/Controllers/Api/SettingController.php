<?php
namespace App\Http\Controllers\Api;

use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends BaseController
{
    public function index(): JsonResponse
    {
        $settings = SystemSetting::orderBy('setting_key')->get()
            ->mapWithKeys(fn($s) => [$s->setting_key => [
                'value'       => $s->setting_value,
                'type'        => $s->setting_type,
                'description' => $s->description,
            ]]);

        return $this->successResponse($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings'         => 'required|array',
            'settings.*.key'   => 'required|string|exists:system_settings,setting_key',
            'settings.*.value' => 'required',
        ]);

        foreach ($request->settings as $item) {
            SystemSetting::where('setting_key', $item['key'])
                ->update(['setting_value' => $item['value']]);

            // Hapus cache setting yang diupdate
            Cache::forget("setting_{$item['key']}");
        }

        return $this->successResponse(null, 'Pengaturan berhasil disimpan');
    }
}
