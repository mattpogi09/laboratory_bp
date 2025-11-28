<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Transaction searches (transaction number, patient name)
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('transaction_number', 'idx_transactions_number');
            $table->index('patient_first_name', 'idx_transactions_patient_first_name');
            $table->index('patient_last_name', 'idx_transactions_patient_last_name');
            $table->index('created_at', 'idx_transactions_created_at');
            $table->index('patient_id', 'idx_transactions_patient_id');
            $table->index('cashier_id', 'idx_transactions_cashier_id');
        });

        // Patient searches (name, email)
        Schema::table('patients', function (Blueprint $table) {
            $table->index('first_name', 'idx_patients_first_name');
            $table->index('last_name', 'idx_patients_last_name');
            $table->index('email', 'idx_patients_email');
        });

        // Result submissions (for history searches and sorting)
        Schema::table('result_submissions', function (Blueprint $table) {
            $table->index('sent_at', 'idx_result_submissions_sent_at');
            $table->index('submission_type', 'idx_result_submissions_type');
            $table->index('transaction_id', 'idx_result_submissions_transaction_id');
            $table->index('sent_by', 'idx_result_submissions_sent_by');
        });

        // Composite index for result submissions (type + sent_at)
        DB::statement('CREATE INDEX IF NOT EXISTS idx_result_submissions_type_sent ON result_submissions(submission_type, sent_at DESC)');

        // Transaction tests (for status filtering)
        Schema::table('transaction_tests', function (Blueprint $table) {
            $table->index('status', 'idx_transaction_tests_status');
            $table->index('released_at', 'idx_transaction_tests_released_at');
            $table->index('transaction_id', 'idx_transaction_tests_transaction_id');
        });

        // Case-insensitive search indexes (for ILIKE queries) - PostgreSQL specific
        if (config('database.default') === 'pgsql') {
            DB::statement('CREATE INDEX IF NOT EXISTS idx_transactions_number_lower ON transactions(LOWER(transaction_number))');
            DB::statement('CREATE INDEX IF NOT EXISTS idx_transactions_patient_first_name_lower ON transactions(LOWER(patient_first_name))');
            DB::statement('CREATE INDEX IF NOT EXISTS idx_transactions_patient_last_name_lower ON transactions(LOWER(patient_last_name))');
            DB::statement('CREATE INDEX IF NOT EXISTS idx_patients_email_lower ON patients(LOWER(email))');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes from transactions table
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_transactions_number');
            $table->dropIndex('idx_transactions_patient_first_name');
            $table->dropIndex('idx_transactions_patient_last_name');
            $table->dropIndex('idx_transactions_created_at');
            $table->dropIndex('idx_transactions_patient_id');
            $table->dropIndex('idx_transactions_cashier_id');
        });

        // Drop indexes from patients table
        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex('idx_patients_first_name');
            $table->dropIndex('idx_patients_last_name');
            $table->dropIndex('idx_patients_email');
        });

        // Drop indexes from result_submissions table
        Schema::table('result_submissions', function (Blueprint $table) {
            $table->dropIndex('idx_result_submissions_sent_at');
            $table->dropIndex('idx_result_submissions_type');
            $table->dropIndex('idx_result_submissions_transaction_id');
            $table->dropIndex('idx_result_submissions_sent_by');
        });

        // Drop composite index
        DB::statement('DROP INDEX IF EXISTS idx_result_submissions_type_sent');

        // Drop indexes from transaction_tests table
        Schema::table('transaction_tests', function (Blueprint $table) {
            $table->dropIndex('idx_transaction_tests_status');
            $table->dropIndex('idx_transaction_tests_released_at');
            $table->dropIndex('idx_transaction_tests_transaction_id');
        });

        // Drop case-insensitive indexes
        if (config('database.default') === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_transactions_number_lower');
            DB::statement('DROP INDEX IF EXISTS idx_transactions_patient_first_name_lower');
            DB::statement('DROP INDEX IF EXISTS idx_transactions_patient_last_name_lower');
            DB::statement('DROP INDEX IF EXISTS idx_patients_email_lower');
        }
    }
};
