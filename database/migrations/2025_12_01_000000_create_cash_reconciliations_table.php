<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cash_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->date('reconciliation_date');
            $table->decimal('expected_cash', 12, 2); // System calculated total
            $table->decimal('actual_cash', 12, 2); // Cashier counted total
            $table->decimal('variance', 12, 2); // Difference (actual - expected)
            $table->integer('transaction_count'); // Number of transactions
            $table->text('notes')->nullable(); // Cashier notes
            $table->foreignId('cashier_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique('reconciliation_date');
            $table->index('cashier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_reconciliations');
    }
};
