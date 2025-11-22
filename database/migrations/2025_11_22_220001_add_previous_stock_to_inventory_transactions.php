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
    Schema::table('inventory_transactions', function (Blueprint $table) {
      $table->integer('previous_stock')->after('quantity')->nullable();
      $table->integer('new_stock')->after('previous_stock')->nullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('inventory_transactions', function (Blueprint $table) {
      $table->dropColumn(['previous_stock', 'new_stock']);
    });
  }
};
