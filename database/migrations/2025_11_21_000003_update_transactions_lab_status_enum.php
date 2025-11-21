<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    // For PostgreSQL, we need to drop and recreate the enum type
    DB::statement("ALTER TABLE transactions ALTER COLUMN lab_status DROP DEFAULT");
    DB::statement("ALTER TABLE transactions ALTER COLUMN lab_status TYPE VARCHAR(20)");

    // Update existing data: 'in_progress' -> 'processing'
    DB::statement("UPDATE transactions SET lab_status = 'processing' WHERE lab_status = 'in_progress'");

    // Create new enum type
    DB::statement("
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_lab_status_new') THEN
                    CREATE TYPE transaction_lab_status_new AS ENUM ('pending', 'processing', 'completed', 'released');
                END IF;
            END $$;
        ");

    DB::statement("ALTER TABLE transactions ALTER COLUMN lab_status TYPE transaction_lab_status_new USING lab_status::transaction_lab_status_new");
    DB::statement("ALTER TABLE transactions ALTER COLUMN lab_status SET DEFAULT 'pending'");
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    DB::statement("ALTER TABLE transactions ALTER COLUMN lab_status DROP DEFAULT");
    DB::statement("ALTER TABLE transactions ALTER COLUMN lab_status TYPE VARCHAR(20)");

    // Revert: 'processing' -> 'in_progress'
    DB::statement("UPDATE transactions SET lab_status = 'in_progress' WHERE lab_status = 'processing'");

    DB::statement("
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_lab_status_old') THEN
                    CREATE TYPE transaction_lab_status_old AS ENUM ('pending', 'in_progress', 'completed', 'released');
                END IF;
            END $$;
        ");

    DB::statement("ALTER TABLE transactions ALTER COLUMN lab_status TYPE transaction_lab_status_old USING lab_status::transaction_lab_status_old");
    DB::statement("ALTER TABLE transactions ALTER COLUMN lab_status SET DEFAULT 'pending'");
  }
};
