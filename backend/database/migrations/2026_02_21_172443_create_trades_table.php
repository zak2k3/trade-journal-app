<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ticker', 10);
            $table->decimal('entry_price', 12, 2);
            $table->decimal('exit_price', 12, 2);
            $table->integer('quantity');
            $table->date('trade_date');
            $table->text('notes')->nullable();
            $table->string('direction', 10)->default('long'); // long or short
            $table->string('status', 20)->default('closed'); // open, closed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trades');
    }
};