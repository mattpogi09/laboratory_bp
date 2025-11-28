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
            // Drop old address column
            $table->dropColumn('patient_address');
            
            // Add new address lookup columns using PSGC codes (strings)
            $table->string('region_id', 2)->nullable()->index();
            $table->string('province_id', 5)->nullable()->index();
            $table->string('city_id', 7)->nullable()->index();
            $table->string('barangay_code', 10)->nullable()->index();
            $table->string('patient_street')->nullable();
            
            // Update contact column validation
            $table->string('patient_contact', 11)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn(['region_id', 'province_id', 'city_id', 'barangay_code', 'patient_street']);
            
            // Restore old address column
            $table->text('patient_address')->nullable();
        });
    }
};
