<?php
namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Carbon\Carbon;

class SelfieService
{
    private ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    public function addWatermark($imageFile, string $employeeName, string $siteName, Carbon $time): string
    {
        $image = $this->manager->read($imageFile->getPathname());

        // Resize jika terlalu besar (max 1280px)
        if ($image->width() > 1280) {
            $image->scaleDown(1280);
        }

        // Watermark background (semi-transparent strip di bawah)
        $width = $image->width();
        $height = $image->height();

        // Add dark overlay di bagian bawah
        $image->drawRectangle(0, $height - 80, function ($draw) use ($width, $height) {
            $draw->size($width, 80);
            $draw->background('rgba(0, 0, 0, 0.6)');
        });

        // Add teks watermark
        $image->text(
            $employeeName,
            20, $height - 60,
            function ($font) {
                $font->filename(public_path('fonts/Roboto-Bold.ttf'));
                $font->size(18);
                $font->color('#FFFFFF');
            }
        );

        $image->text(
            $siteName,
            20, $height - 38,
            function ($font) {
                $font->filename(public_path('fonts/Roboto-Regular.ttf'));
                $font->size(14);
                $font->color('#CCCCCC');
            }
        );

        $image->text(
            $time->format('d/m/Y H:i:s') . ' WIB',
            20, $height - 16,
            function ($font) {
                $font->filename(public_path('fonts/Roboto-Regular.ttf'));
                $font->size(14);
                $font->color('#FFCC00');
            }
        );

        // Simpan ke temp file
        $tempPath = sys_get_temp_dir() . '/selfie_' . uniqid() . '.jpg';
        $image->toJpeg(85)->save($tempPath);

        return $tempPath;
    }
}
