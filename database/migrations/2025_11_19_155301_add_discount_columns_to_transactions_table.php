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
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('discount_name')->nullable()->after('payment_method');
            $table->decimal('discount_rate', 5, 2)->default(0)->after('discount_name');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('discount_rate');
            $table->decimal('net_total', 12, 2)->default(0)->after('discount_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['discount_name', 'discount_rate', 'discount_amount', 'net_total']);
        });
    }
};
