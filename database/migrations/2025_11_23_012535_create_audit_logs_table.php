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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('user_name')->nullable();
            $table->string('user_role', 50)->nullable()->index();
            $table->string('action_type', 100)->index(); // e.g., 'user_created', 'login', 'transaction_created'
            $table->string('action_category', 50)->index(); // e.g., 'authentication', 'user_management', 'transactions'
            $table->text('description'); // Human-readable description
            $table->json('metadata')->nullable(); // Detailed before/after values, additional context
            $table->string('ip_address', 45)->nullable(); // Support IPv4 and IPv6
            $table->string('severity', 20)->default('info')->index(); // info, warning, critical
            $table->string('entity_type', 100)->nullable(); // e.g., 'User', 'Transaction', 'Patient'
            $table->unsignedBigInteger('entity_id')->nullable(); // ID of the affected entity
            $table->timestamp('created_at')->index(); // For 60-day retention queries

            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');

            // Composite index for common queries
            $table->index(['created_at', 'user_role', 'action_category']);
            $table->index(['created_at', 'severity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
