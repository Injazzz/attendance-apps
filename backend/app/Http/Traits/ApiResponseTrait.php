<?php

namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    protected function successResponse(
        mixed $data = null,
        string $message = 'Success',
        int $code = 200
    ): JsonResponse {
        return response()->json([
            'success'   => true,
            'message'   => $message,
            'data'      => $data,
            'timestamp' => now()->toIso8601String(),
        ], $code);
    }

    protected function errorResponse(
        string $message,
        mixed $errors = null,
        int $code = 400,
        string $errorCode = 'BAD_REQUEST'
    ): JsonResponse {
        return response()->json([
            'success'    => false,
            'message'    => $message,
            'error_code' => $errorCode,
            'errors'     => $errors,
            'timestamp'  => now()->toIso8601String(),
        ], $code);
    }

    protected function paginatedResponse(
        mixed $paginator,
        string $message = 'Success'
    ): JsonResponse {
        // Support both LengthAwarePaginator dan array biasa
        if (is_object($paginator) && method_exists($paginator, 'currentPage')) {
            return response()->json([
                'success'   => true,
                'message'   => $message,
                'data'      => $paginator->items(),
                'meta'      => [
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                    'per_page'     => $paginator->perPage(),
                    'total'        => $paginator->total(),
                    'from'         => $paginator->firstItem(),
                    'to'           => $paginator->lastItem(),
                ],
                'timestamp' => now()->toIso8601String(),
            ]);
        }

        return $this->successResponse($paginator, $message);
    }
}
