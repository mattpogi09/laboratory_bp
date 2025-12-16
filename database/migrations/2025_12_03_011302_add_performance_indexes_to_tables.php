<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds indexes to improve query performance for both web and mobile apps.
     * Safe approach - adds only if not exists using PostgreSQL's IF NOT EXISTS.
     */
    public function up(): void
    {
        // Use raw SQL for PostgreSQL which supports IF NOT EXISTS
        DB::statement('CREATE INDEX IF NOT EXISTS patients_email_index ON patients(email)');
        DB::statement('CREATE INDEX IF NOT EXISTS patients_contact_number_index ON patients(contact_number)');
        DB::statement('CREATE INDEX IF NOT EXISTS patients_is_active_index ON patients(is_active)');
        DB::statement('CREATE INDEX IF NOT EXISTS patients_name_index ON patients(first_name, last_name)');
        DB::statement('CREATE INDEX IF NOT EXISTS patients_created_at_index ON patients(created_at)');

        DB::statement('CREATE INDEX IF NOT EXISTS transactions_patient_id_index ON transactions(patient_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS transactions_cashier_id_index ON transactions(cashier_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS transactions_payment_status_index ON transactions(payment_status)');
        DB::statement('CREATE INDEX IF NOT EXISTS transactions_created_at_index ON transactions(created_at)');

        DB::statement('CREATE INDEX IF NOT EXISTS transaction_tests_transaction_id_index ON transaction_tests(transaction_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS transaction_tests_lab_test_id_index ON transaction_tests(lab_test_id)');

        DB::statement('CREATE INDEX IF NOT EXISTS lab_tests_is_active_index ON lab_tests(is_active)');

        DB::statement('CREATE INDEX IF NOT EXISTS users_role_index ON users(role)');
        DB::statement('CREATE INDEX IF NOT EXISTS users_is_active_index ON users(is_active)');
    }

    /**
     * Reverse the migrations.
     * 
     * Safely removes indexes if needed to rollback.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS patients_email_index');
        DB::statement('DROP INDEX IF EXISTS patients_contact_number_index');
        DB::statement('DROP INDEX IF EXISTS patients_is_active_index');
        DB::statement('DROP INDEX IF EXISTS patients_name_index');
        DB::statement('DROP INDEX IF EXISTS patients_created_at_index');

        DB::statement('DROP INDEX IF EXISTS transactions_patient_id_index');
        DB::statement('DROP INDEX IF EXISTS transactions_cashier_id_index');
        DB::statement('DROP INDEX IF EXISTS transactions_payment_status_index');
        DB::statement('DROP INDEX IF EXISTS transactions_created_at_index');

        DB::statement('DROP INDEX IF EXISTS transaction_tests_transaction_id_index');
        DB::statement('DROP INDEX IF EXISTS transaction_tests_lab_test_id_index');

        DB::statement('DROP INDEX IF EXISTS lab_tests_is_active_index');

        DB::statement('DROP INDEX IF EXISTS users_role_index');
        DB::statement('DROP INDEX IF EXISTS users_is_active_index');
    }
};
