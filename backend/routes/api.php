<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
*/
// Public routes
Route::post('/register', [App\Http\Controllers\AuthController::class, 'register']); Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
// Protected routes(require authentication) 
Route::middleware('auth:sanctum')->group(function () { 
    // User info 
    Route::get('/user', function (Request $request) { return $request->user(); });
    
    // Logout
    Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout']);

    // Trade routes
    Route::apiResource('trades', App\Http\Controllers\TradeController::class);

    // Tag routes
    Route::apiResource('tags', App\Http\Controllers\TagController::class);

    // Trade tags (attach/detach)
    Route::post('/trades/{trade}/tags', [App\Http\Controllers\TradeController::class, 'attachTags']);
    Route::delete('/trades/{trade}/tags/{tag}', [App\Http\Controllers\TradeController::class, 'detachTag']);

    // Analytics
    Route::get('/analytics', [App\Http\Controllers\AnalyticsController::class, 'index']);
});