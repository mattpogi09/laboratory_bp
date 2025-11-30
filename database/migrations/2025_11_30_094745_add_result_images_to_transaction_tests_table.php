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
        Schema::table('transaction_tests', function (Blueprint $table) {
            $table->json('result_images')->nullable()->after('result_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_tests', function (Blueprint $table) {
            $table->dropColumn('result_images');
        });
    }
};
