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
Route::get('/test-mail', function () {
    try {
        \Illuminate\Support\Facades\Mail::raw('Test', function ($message) {
            $message->to('your-email@gmail.com')->subject('Test');
        });
        return response()->json(['message' => 'Sent']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
// Route::get('/fix-all', function () {
//     try {
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS trades CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS trade_tag CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS tags CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS personal_access_tokens CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS users CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS password_reset_tokens CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS sessions CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS migrations CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS cache CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS cache_locks CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS cache_tags CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS jobs CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS job_batches CASCADE');
//         \Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS failed_jobs CASCADE');
        
//         \Artisan::call('migrate', ['--force' => true]);
        
//         return response()->json(['message' => 'Fixed!']);
//     } catch (\Exception $e) {
//         return response()->json(['error' => $e->getMessage()], 500);
//     }
// });
Route::get('/run-migrations', function () {
    try {
        // Create personal_access_tokens directly
        \Illuminate\Support\Facades\DB::statement('
            CREATE TABLE IF NOT EXISTS personal_access_tokens (
                id BIGSERIAL PRIMARY KEY,
                tokenable_type VARCHAR(255) NOT NULL,
                tokenable_id BIGINT NOT NULL,
                name VARCHAR(255) NOT NULL,
                token VARCHAR(64) NOT NULL UNIQUE,
                abilities TEXT,
                expires_at TIMESTAMP,
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP NOT NULL
            )
        ');
        
        // Create index
        try { \Illuminate\Support\Facades\DB::statement('CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index ON personal_access_tokens (tokenable_type, tokenable_id)'); } catch (\Exception $e) {}
        
        return response()->json(['message' => 'Tables created']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Actually, just remove API routes from CSRF - use stateless

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