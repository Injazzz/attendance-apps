<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemSetting;
use App\Models\AttendanceRule;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        // Setting sistem
        $settings = [
            ['setting_key' => 'app_name',           'setting_value' => 'Attendance System',    'setting_type' => 'string',  'description' => 'Nama aplikasi'],
            ['setting_key' => 'app_timezone',        'setting_value' => 'Asia/Jakarta',          'setting_type' => 'string',  'description' => 'Timezone aplikasi'],
            ['setting_key' => 'max_login_attempts',  'setting_value' => '5',                     'setting_type' => 'integer', 'description' => 'Maks percobaan login'],
            ['setting_key' => 'lock_duration_minutes','setting_value' => '30',                   'setting_type' => 'integer', 'description' => 'Durasi lock akun (menit)'],
            ['setting_key' => 'qr_default_interval', 'setting_value' => '30',                   'setting_type' => 'integer', 'description' => 'Interval refresh QR default (detik)'],
            ['setting_key' => 'selfie_max_size_kb',  'setting_value' => '5120',                 'setting_type' => 'integer', 'description' => 'Ukuran maksimal foto selfie (KB)'],
            ['setting_key' => 'allow_manual_attendance','setting_value' => 'false',             'setting_type' => 'boolean', 'description' => 'Izinkan absensi manual oleh admin'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['setting_key' => $setting['setting_key']],
                $setting
            );
        }

        // Aturan absensi default
        AttendanceRule::create([
            'rule_name'                  => 'Aturan Kerja Normal',
            'start_time'                 => '08:00:00',
            'end_time'                   => '17:00:00',
            'late_threshold'             => 30,     // terlambat jika > 30 menit dari jam masuk
            'late_deduction_per_minute'  => 0,      // potongan per menit (isi sesuai kebijakan)
            'late_grace_period'          => 15,     // toleransi 15 menit
            'max_late_minutes_per_month' => 120,    // max telat 120 menit per bulan
            'overtime_start_after'       => 60,     // lembur dihitung setelah 60 menit dari jam pulang
        ]);

        $this->command->info('System settings seeded successfully.');
    }
}
