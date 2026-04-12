<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('qr-display.{displayId}', function () {
    return true; // siapapun bisa subscribe (hanya untuk baca QR)
});
