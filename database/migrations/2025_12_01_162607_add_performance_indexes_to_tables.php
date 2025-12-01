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
        // Add indexes for frequently queried status columns
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('payment_status', 'idx_transactions_payment_status');
            $table->index('payment_method', 'idx_transactions_payment_method');
            $table->index('lab_status', 'idx_transactions_lab_status');
        });

        // Add composite index for date-based revenue queries
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['payment_status', 'created_at'], 'idx_transactions_payment_created');
        });

        // Add index for inventory status filtering
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->index('status', 'idx_inventory_items_status');
            $table->index(['status', 'current_stock'], 'idx_inventory_items_status_stock');
        });

        // Add index for cash reconciliation date queries
        Schema::table('cash_reconciliations', function (Blueprint $table) {
            $table->index('reconciliation_date', 'idx_cash_reconciliations_date');
            $table->index('variance', 'idx_cash_reconciliations_variance');
        });

        // Add indexes for audit log queries
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('action_category', 'idx_audit_logs_category');
            $table->index('severity', 'idx_audit_logs_severity');
            $table->index(['action_category', 'created_at'], 'idx_audit_logs_category_date');
        });

        // Add index for inventory transaction type filtering
        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->index('type', 'idx_inventory_transactions_type');
            $table->index(['item_id', 'created_at'], 'idx_inventory_transactions_item_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_transactions_payment_status');
            $table->dropIndex('idx_transactions_payment_method');
            $table->dropIndex('idx_transactions_lab_status');
            $table->dropIndex('idx_transactions_payment_created');
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropIndex('idx_inventory_items_status');
            $table->dropIndex('idx_inventory_items_status_stock');
        });

        Schema::table('cash_reconciliations', function (Blueprint $table) {
            $table->dropIndex('idx_cash_reconciliations_date');
            $table->dropIndex('idx_cash_reconciliations_variance');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_logs_category');
            $table->dropIndex('idx_audit_logs_severity');
            $table->dropIndex('idx_audit_logs_category_date');
        });

        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_inventory_transactions_type');
            $table->dropIndex('idx_inventory_transactions_item_date');
        });
    }
};
