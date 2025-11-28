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
        Schema::table('patients', function (Blueprint $table) {
            // Drop old address column
            $table->dropColumn('address');
            
            // Add new address lookup columns using PSGC codes (strings)
            $table->string('region_id', 2)->nullable()->index();
            $table->string('province_id', 5)->nullable()->index();
            $table->string('city_id', 7)->nullable()->index();
            $table->string('barangay_code', 10)->nullable()->index(); // barangays use 'code' field
            $table->string('street')->nullable();
            
            // Update contact_number column validation
            $table->string('contact_number', 11)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn(['region_id', 'province_id', 'city_id', 'barangay_code', 'street']);
            
            // Restore old address column
            $table->text('address')->nullable();
        });
    }
};
