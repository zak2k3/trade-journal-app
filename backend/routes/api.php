<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TradeController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\AnalyticsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password reset
Route::post('/password/email', [App\Http\Controllers\PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [App\Http\Controllers\PasswordResetController::class, 'resetPassword']);

// Email verification (public, no auth middleware)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');

// Protected routes (require auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Check if email verified
    Route::get('/user/verification-status', [AuthController::class, 'checkVerification']);
    Route::post('/user/resend-verification', [AuthController::class, 'resendVerification']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Trades CRUD
    Route::apiResource('trades', TradeController::class);

    // Tags CRUD
    Route::apiResource('tags', TagController::class);

    // Attach/detach tags to trades
    Route::post('/trades/{trade}/tags', [TradeController::class, 'attachTags']);
    Route::delete('/trades/{trade}/tags/{tag}', [TradeController::class, 'detachTag']);

    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index']);

    // Export/Import
    Route::get('/export/csv', [ExportController::class, 'exportCsv']);
    Route::get('/export/json', [ExportController::class, 'exportJson']);
    Route::post('/import/json', [ExportController::class, 'importJson']);
});