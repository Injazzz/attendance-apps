<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogApiRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $startTime = microtime(true);

        $response = $next($request);

        $duration = round((microtime(true) - $startTime) * 1000, 2);

        // Jangan log request yang terlalu besar atau sensitif
        $shouldLog = !in_array($request->route()?->getName(), [
            'auth.login', // sudah ada log di AuthService
        ]);

        if ($shouldLog && config('app.debug')) {
            Log::channel('daily')->info('API Request', [
                'method'      => $request->method(),
                'url'         => $request->fullUrl(),
                'route'       => $request->route()?->getName(),
                'user_id'     => $request->user()?->id,
                'status_code' => $response->getStatusCode(),
                'duration_ms' => $duration,
                'ip'          => $request->ip(),
            ]);
        }

        // Tambahkan header timing ke response (berguna untuk debug)
        $response->headers->set('X-Response-Time', $duration . 'ms');

        return $response;
    }
}
