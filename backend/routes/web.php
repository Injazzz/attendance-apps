<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Broadcasting\BroadcastController;

Route::get('/', function () {
    return view('welcome');
});

// ============================================
// PWA ASSETS ROUTES
// ============================================

// Serve PWA manifest
Route::get('/manifest.webmanifest', function () {
    $manifestPath = base_path('../frontend/dist/manifest.webmanifest');

    if (!file_exists($manifestPath)) {
        abort(404, 'Manifest not found');
    }

    $response = response()->file($manifestPath, ['Content-Type' => 'application/manifest+json']);
    $response->setMaxAge(3600);
    $response->setPublic();
    return $response;
});

// Serve Service Worker
Route::get('/sw.js', function () {
    $swPath = base_path('../frontend/dist/sw.js');

    if (!file_exists($swPath)) {
        abort(404, 'Service Worker not found');
    }

    $response = response()->file($swPath, ['Content-Type' => 'application/javascript']);
    $response->setMaxAge(0);
    $response->setPublic();
    $response->headers->set('Cache-Control', 'public, max-age=0, must-revalidate');
    return $response;
});

// Serve Workbox files
Route::get('/workbox-{hash}.js', function ($hash) {
    $workboxPath = base_path("../frontend/dist/workbox-{$hash}.js");

    if (!file_exists($workboxPath)) {
        abort(404, 'Workbox file not found');
    }

    $response = response()->file($workboxPath, ['Content-Type' => 'application/javascript']);
    $response->setMaxAge(31536000);
    $response->setPublic();
    $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
    return $response;
});

// Serve PWA icons
Route::get('/icons/{filename}', function ($filename) {
    $iconPath = base_path("../frontend/dist/icons/{$filename}");

    if (!file_exists($iconPath)) {
        abort(404, 'Icon not found');
    }

    $mimeType = match(pathinfo($filename, PATHINFO_EXTENSION)) {
        'png' => 'image/png',
        'jpg', 'jpeg' => 'image/jpeg',
        'svg' => 'image/svg+xml',
        default => 'application/octet-stream',
    };

    $response = response()->file($iconPath, ['Content-Type' => $mimeType]);
    $response->setMaxAge(31536000);
    $response->setPublic();
    $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
    return $response;
});

// Broadcasting authentication for Reverb
// Note: BroadcastController handles authentication internally
Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate']);

