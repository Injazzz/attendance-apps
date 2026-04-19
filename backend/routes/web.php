<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Broadcasting\BroadcastController;

Route::get('/', function () {
    return view('welcome');
});

// Broadcasting authentication for Reverb
// Note: BroadcastController handles authentication internally
Route::post('/broadcasting/auth', [BroadcastController::class, 'authenticate']);

