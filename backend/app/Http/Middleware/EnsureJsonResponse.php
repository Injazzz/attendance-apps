<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureJsonResponse
{
    /**
     * Handle an incoming request.
     *
     * Forces JSON response for API and broadcasting routes.
     * This prevents Laravel from redirecting to login page as HTML
     * and ensures API always returns JSON errors.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Force JSON response for API and broadcasting routes
        if ($request->is('api/*') || $request->is('broadcasting/*')) {
            $request->headers->set('Accept', 'application/json');
        }

        return $next($request);
    }
}
