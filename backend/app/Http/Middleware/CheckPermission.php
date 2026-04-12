<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!$request->user()?->can($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Permission tidak mencukupi.',
            ], 403);
        }
        return $next($request);
    }
}
