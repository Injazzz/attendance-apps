<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * Middleware untuk mengatur security headers yang diperlukan untuk PWA
 * Memastikan aplikasi dapat diinstal dan bekerja offline dengan aman
 */
class SetPwaSecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): SymfonyResponse
    {
        $response = $next($request);

        // ============================================================
        // 1. PWA MANIFEST HEADER
        // ============================================================
        // Pastikan manifest.webmanifest disajikan dengan MIME type yang benar
        if ($request->path() === 'manifest.webmanifest' ||
            $request->path() === 'manifest.json') {
            $response->headers->set('Content-Type', 'application/manifest+json; charset=utf-8');
        }

        // ============================================================
        // 2. SERVICE WORKER HEADERS
        // ============================================================
        // Izinkan Service Worker mengakses resource di root path
        if ($request->path() === 'sw.js' ||
            strpos($request->path(), 'sw.') === 0 ||
            $request->path() === 'workbox-') {
            $response->headers->set('Service-Worker-Allowed', '/');
            $response->headers->set('Content-Type', 'application/javascript; charset=utf-8');
        }

        // ============================================================
        // 3. CROSS-ORIGIN HEADERS
        // ============================================================
        // Izinkan CORS untuk manifest dan icons
        if ($request->path() === 'manifest.webmanifest' ||
            strpos($request->path(), 'icons/') === 0 ||
            strpos($request->path(), 'manifest.') === 0) {
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', '*');
        }

        // ============================================================
        // 4. CACHE CONTROL HEADERS
        // ============================================================
        // Cache manifest dan service worker dengan cache busting
        if ($request->path() === 'manifest.webmanifest' ||
            $request->path() === 'manifest.json') {
            $response->headers->set('Cache-Control', 'public, max-age=3600'); // 1 jam cache
        }

        if ($request->path() === 'sw.js' || strpos($request->path(), 'sw.') === 0) {
            $response->headers->set('Cache-Control', 'public, max-age=0, must-revalidate'); // No cache untuk SW
        }

        if (strpos($request->path(), 'icons/') === 0) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000'); // 1 tahun untuk icons
        }

        // ============================================================
        // 5. SECURITY HEADERS
        // ============================================================
        // Strict-Transport-Security untuk HTTPS (jika di production)
        if ($this->isHttps($request)) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // X-Content-Type-Options untuk prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // X-Frame-Options untuk prevent clickjacking
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Content-Security-Policy untuk PWA
        $this->setContentSecurityPolicy($response, $request);

        // Referrer-Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions-Policy (untuk camera, microphone, geolocation yang mungkin dipakai app)
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

        return $response;
    }

    /**
     * Tentukan apakah request melalui HTTPS
     */
    private function isHttps(Request $request): bool
    {
        // Cek apakah HTTPS
        if ($request->secure()) {
            return true;
        }

        // Cek X-Forwarded-Proto header (untuk proxy/ngrok)
        if ($request->header('X-Forwarded-Proto') === 'https') {
            return true;
        }

        // Cek APP_URL
        if (str_starts_with(config('app.url'), 'https')) {
            return true;
        }

        return false;
    }

    /**
     * Set Content-Security-Policy header untuk PWA
     */
    private function setContentSecurityPolicy(SymfonyResponse $response, Request $request): void
    {
        $isDev = app()->environment('local', 'testing');

        $policy = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // inline scripts untuk Vite dll
            "style-src 'self' 'unsafe-inline'", // inline styles untuk Tailwind
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' ws: wss: https:", // WebSocket untuk broadcasting
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests", // Force HTTPS jika tersedia
        ];

        // Relax CSP di development
        if ($isDev) {
            $policy[] = "script-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:*";
            $policy[] = "style-src 'self' 'unsafe-inline'";
        }

        $response->headers->set('Content-Security-Policy', implode('; ', $policy));
    }
}
