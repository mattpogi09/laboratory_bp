<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;

class CleanupAuditLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:cleanup {--days=60 : Number of days to retain audit logs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete audit logs older than specified days (default: 60 days)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $cutoffDate = now()->subDays($days);

        $this->info("Cleaning up audit logs older than {$days} days (before {$cutoffDate->toDateTimeString()})...");

        $deletedCount = AuditLog::where('created_at', '<', $cutoffDate)->delete();

        if ($deletedCount > 0) {
            $this->info("✓ Deleted {$deletedCount} audit log(s).");
        } else {
            $this->info("✓ No audit logs to delete.");
        }

        // Optimize database table (PostgreSQL)
        $this->info("Optimizing audit_logs table...");
        \DB::statement('VACUUM ANALYZE audit_logs');
        $this->info("✓ Table optimized.");

        return Command::SUCCESS;
    }
}

