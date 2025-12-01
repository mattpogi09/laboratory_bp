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
        Schema::table('cash_reconciliations', function (Blueprint $table) {
            $table->boolean('correction_requested')->default(false)->after('notes');
            $table->text('correction_reason')->nullable()->after('correction_requested');
            $table->timestamp('correction_requested_at')->nullable()->after('correction_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_reconciliations', function (Blueprint $table) {
            $table->dropColumn(['correction_requested', 'correction_reason', 'correction_requested_at']);
        });
    }
};
