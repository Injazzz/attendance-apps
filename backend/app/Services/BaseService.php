<?php
namespace App\Services;

abstract class BaseService
{
    protected function success($data = null, string $message = 'Success'): array
    {
        return compact('data', 'message');
    }

    protected function fail(string $message, $errors = null): array
    {
        return compact('message', 'errors');
    }
}
