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
    // For PostgreSQL, we need to drop and recreate the enum type
    DB::statement("ALTER TABLE transaction_tests ALTER COLUMN status DROP DEFAULT");
    DB::statement("ALTER TABLE transaction_tests ALTER COLUMN status TYPE VARCHAR(20)");

    // Update existing data: 'in_progress' -> 'processing'
    DB::statement("UPDATE transaction_tests SET status = 'processing' WHERE status = 'in_progress'");

    // Add new status column with the correct enum
    DB::statement("
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_test_status_new') THEN
                    CREATE TYPE transaction_test_status_new AS ENUM ('pending', 'processing', 'completed', 'released');
                END IF;
            END $$;
        ");

    DB::statement("ALTER TABLE transaction_tests ALTER COLUMN status TYPE transaction_test_status_new USING status::transaction_test_status_new");
    DB::statement("ALTER TABLE transaction_tests ALTER COLUMN status SET DEFAULT 'pending'");
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    DB::statement("ALTER TABLE transaction_tests ALTER COLUMN status DROP DEFAULT");
    DB::statement("ALTER TABLE transaction_tests ALTER COLUMN status TYPE VARCHAR(20)");

    // Revert: 'processing' -> 'in_progress'
    DB::statement("UPDATE transaction_tests SET status = 'in_progress' WHERE status = 'processing'");

    DB::statement("
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_test_status_old') THEN
                    CREATE TYPE transaction_test_status_old AS ENUM ('pending', 'in_progress', 'completed');
                END IF;
            END $$;
        ");

    DB::statement("ALTER TABLE transaction_tests ALTER COLUMN status TYPE transaction_test_status_old USING status::transaction_test_status_old");
    DB::statement("ALTER TABLE transaction_tests ALTER COLUMN status SET DEFAULT 'pending'");
  }
};
