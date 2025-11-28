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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->string('receipt_number')->unique();
            $table->unsignedInteger('queue_number')->default(1);

            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->string('patient_first_name');
            $table->string('patient_last_name');
            $table->string('patient_middle_name')->nullable();
            $table->unsignedTinyInteger('patient_age')->nullable();
            $table->string('patient_gender')->nullable();
            $table->string('patient_contact')->nullable();
            $table->string('patient_address')->nullable();

            $table->enum('payment_status', ['pending', 'paid', 'refunded', 'void'])->default('pending');
            $table->string('payment_method')->default('cash');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('discount_name')->nullable();
            $table->decimal('discount_rate', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->string('philhealth_name')->nullable();
            $table->decimal('philhealth_coverage', 5, 2)->default(0);
            $table->decimal('philhealth_amount', 12, 2)->default(0);
            $table->decimal('net_total', 12, 2)->default(0);
            $table->decimal('amount_tendered', 12, 2)->default(0);
            $table->decimal('change_due', 12, 2)->default(0);
            $table->decimal('balance_due', 12, 2)->default(0);

            $table->enum('lab_status', ['pending', 'processing', 'completed', 'released'])->default('pending');
            $table->text('notes')->nullable();

            $table->foreignId('cashier_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['lab_status', 'payment_status']);
            $table->index(['patient_last_name', 'patient_first_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
