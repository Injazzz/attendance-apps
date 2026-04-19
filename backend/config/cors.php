<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Here you may configure CORS settings for your Laravel application.
    | This allows frontend applications (like React Vite, mobile browsers)
    | to make requests to your API from different origins (domains).
    |
    */

    'paths' => ['api/*', 'broadcasting/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Specific origins (localhost, Ngrok with fixed URLs)
    'allowed_origins' => [
        'http://localhost:5173',      // React Vite dev server
        'http://127.0.0.1:5173',
        'http://localhost:3000',      // Alternative React port
        'http://127.0.0.1:3000',
        'http://localhost:8000',      // Laravel local server
        'http://127.0.0.1:8000',
        'https://arrangeable-raelynn-pearly.ngrok-free.dev',  // Ngrok frontend tunnel
        env('FRONTEND_URL', 'http://localhost:5173'),  // Custom frontend URL
    ],

    // Regex patterns for dynamic origins (Ngrok URLs)
    'allowed_origins_patterns' => [
        '#^https?://.*\.ngrok\.io$#',           // Ngrok HTTP/HTTPS
        '#^https?://.*\.ngrok-free\.dev$#',     // Ngrok free tier
        '#^https?://[0-9a-f]+\.ngrok\.io$#',    // Old Ngrok format
    ],

    // Allow all headers (Authorization, Content-Type, X-Custom-Header, etc.)
    'allowed_headers' => ['*'],

    // Headers exposed to JavaScript from browser
    'exposed_headers' => ['X-Total-Count', 'X-Page-Count', 'X-Laravel-Queue'],

    // How long browser can cache preflight (OPTIONS) requests
    'max_age' => 86400,

    // Allow credentials: cookies, authorization headers, etc.
    'supports_credentials' => true,
];

