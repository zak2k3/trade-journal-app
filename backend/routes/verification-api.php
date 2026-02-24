<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(
    function () { 
        Route::get('/email/verify', function (Request $request) { 
            return $request->user()->hasVerifiedEmail() 
            ? response()->json(['message' => 'Email already verified']) 
            : response()->json(['message' => 'Email not verified'], 400); });
        Route::post('/email/verify-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification link sent']);
    });
});

// Verification handler (called from frontend after clicking email link) 
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail']) ->middleware(['signed']) ->name('verification.verify');