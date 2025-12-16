<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\CashReconciliation;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Transaction;
use App\Models\TransactionTest;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportLogController extends Controller
{
    public function index(Request $request, AuditLogger $auditLogger): Response
    {
        // Validate inputs to prevent SQL injection and malformed data
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'tab' => 'nullable|string|in:financial,lab,inventory,audit,reconciliation',
            'period' => 'nullable|string|in:day,week,month,year',
        ]);

        $dateFrom = $validated['from'] ?? null;
        $dateTo = $validated['to'] ?? null;
        $activeTab = $validated['tab'] ?? 'financial';
        $period = $validated['period'] ?? null;

        // If period is set, calculate date range
        if ($period && !$dateFrom && !$dateTo) {
            $dateRange = $this->getDateRange($period);
            $dateFrom = $dateRange[0]->format('Y-m-d');
            $dateTo = $dateRange[1]->format('Y-m-d');
        }

        // Log report generation
        if ($dateFrom || $dateTo) {
            $reportType = match ($activeTab) {
                'financial' => 'Financial Report',
                'lab' => 'Lab Report',
                'inventory' => 'Inventory Report',
                'audit' => 'Audit Log Report',
                'reconciliation' => 'Cash Reconciliation Report',
                default => 'General Report',
            };
            $auditLogger->logReportGenerated($reportType, $dateFrom, $dateTo);
        }

        $transactionsQuery = Transaction::with(['tests', 'cashier'])
            ->latest();

        $labTestsQuery = TransactionTest::with(['transaction', 'performedBy'])
            ->latest();

        if ($dateFrom) {
            $transactionsQuery->whereDate('created_at', '>=', $dateFrom);
            $labTestsQuery->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $transactionsQuery->whereDate('created_at', '<=', $dateTo);
            $labTestsQuery->whereDate('created_at', '<=', $dateTo);
        }

        $transactions = $transactionsQuery->paginate(50, ['*'], 'financial_page');
        $labTests = $labTestsQuery->paginate(50, ['*'], 'lab_page');

        $financialRows = $transactions->map(function (Transaction $transaction) {
            return [
                'id' => $transaction->id,
                'date' => $transaction->created_at?->toDateString(),
                'transaction_number' => $transaction->transaction_number,
                'patient' => $transaction->patient_full_name,
                'tests' => $transaction->tests->pluck('test_name')->implode(', '),
                'amount' => $transaction->total_amount,
                'discount_amount' => $transaction->discount_amount,
                'discount_name' => $transaction->discount_name,
                'net_amount' => $transaction->net_total,
                'payment_method' => $transaction->payment_method,
                'payment_status' => $transaction->payment_status,
                'performed_by' => $transaction->cashier ? $transaction->cashier->name . ' (Cashier)' : 'Unknown',
            ];
        });

        $financialTotals = [
            'revenue' => Transaction::when($dateFrom, fn($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->sum('net_total'),
            'discounts' => Transaction::when($dateFrom, fn($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->sum('discount_amount'),
            'transactions' => Transaction::when($dateFrom, fn($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->count(),
        ];

        $labStats = [
            'total' => $labTests->total(),
            'pending' => TransactionTest::where('status', 'pending')
                ->when($dateFrom, fn($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->count(),
            'processing' => TransactionTest::where('status', 'processing')
                ->when($dateFrom, fn($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->count(),
            'completed' => TransactionTest::where('status', 'completed')
                ->when($dateFrom, fn($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->count(),
            'released' => TransactionTest::where('status', 'released')
                ->when($dateFrom, fn($q) => $q->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->whereDate('created_at', '<=', $dateTo))
                ->count(),
        ];

        $labRows = $labTests->map(function (TransactionTest $test) {
            return [
                'id' => $test->id,
                'date' => $test->updated_at?->toFormattedDateString(),
                'transaction_number' => $test->transaction?->transaction_number,
                'patient' => $test->transaction?->patient_full_name,
                'test_name' => $test->test_name,
                'performed_by' => $test->performedBy?->name ?? '—',
                'status' => $test->status,
            ];
        });

        return Inertia::render('Configuration/ReportsLogs/ReportsLogsPage', [
            'filters' => [
                'from' => $dateFrom,
                'to' => $dateTo,
                'tab' => $activeTab,
                'period' => $period,
            ],
            'financial' => [
                'rows' => $financialRows,
                'totals' => $financialTotals,
                'pagination' => [
                    'current_page' => $transactions->currentPage(),
                    'last_page' => $transactions->lastPage(),
                    'per_page' => $transactions->perPage(),
                    'total' => $transactions->total(),
                ],
            ],
            'labReport' => [
                'stats' => $labStats,
                'rows' => $labRows,
                'pagination' => [
                    'current_page' => $labTests->currentPage(),
                    'last_page' => $labTests->lastPage(),
                    'per_page' => $labTests->perPage(),
                    'total' => $labTests->total(),
                ],
            ],
            'inventoryLogs' => $this->inventoryLogs($dateFrom, $dateTo, $request),
            'auditLogs' => $this->auditLogs($request, $dateFrom, $dateTo),
            'reconciliationReport' => $this->reconciliationReport($dateFrom, $dateTo),
        ]);
    }

    protected function inventoryLogs($dateFrom = null, $dateTo = null, Request $request): array
    {
        $query = InventoryTransaction::with(['item', 'user'])
            ->latest();

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $inventoryLogs = $query->paginate(50, ['*'], 'inventory_page');

        return [
            'data' => $inventoryLogs->map(function ($transaction) {
                return [
                    'date' => $transaction->created_at->toDateString(),
                    'transactionCode' => $transaction->transaction_code,
                    'item' => $transaction->item->name,
                    'type' => strtoupper($transaction->type),
                    'quantity' => $transaction->quantity,
                    'previousStock' => $transaction->previous_stock,
                    'newStock' => $transaction->new_stock,
                    'reason' => $transaction->reason,
                    'performedBy' => $transaction->user->name,
                ];
            })->toArray(),
            'pagination' => [
                'current_page' => $inventoryLogs->currentPage(),
                'last_page' => $inventoryLogs->lastPage(),
                'per_page' => $inventoryLogs->perPage(),
                'total' => $inventoryLogs->total(),
            ],
        ];
    }

    protected function auditLogs(Request $request, $dateFrom = null, $dateTo = null): array
    {
        // Validate and sanitize inputs to prevent SQL injection
        $validated = $request->validate([
            'audit_search' => 'nullable|string|max:255',
            'role_filter' => 'nullable|string|in:admin,cashier,lab_staff',
            'category_filter' => 'nullable|string|max:100',
            'severity_filter' => 'nullable|string|in:info,warning,critical',
        ]);

        $search = $validated['audit_search'] ?? null;
        $roleFilter = $validated['role_filter'] ?? null;
        $categoryFilter = $validated['category_filter'] ?? null;
        $severityFilter = $validated['severity_filter'] ?? null;

        $query = AuditLog::query()
            ->recent() // Only last 60 days
            ->latest('created_at');

        // Apply filters
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if ($search) {
            $query->search($search);
        }

        if ($roleFilter) {
            $query->byRole($roleFilter);
        }

        if ($categoryFilter) {
            $query->byCategory($categoryFilter);
        }

        if ($severityFilter) {
            $query->bySeverity($severityFilter);
        }

        // Optimized query with index usage
        $auditLogs = $query->select([
            'id',
            'user_name',
            'user_role',
            'action_type',
            'action_category',
            'description',
            'severity',
            'created_at'
        ])->paginate(50, ['*'], 'audit_page');

        return [
            'data' => $auditLogs->map(function ($log) {
                // Format action type for display
                $formattedAction = ucwords(str_replace('_', ' ', $log->action_type));

                return [
                    'id' => $log->id,
                    'timestamp' => $log->created_at->format('Y-m-d H:i:s'),
                    'user' => $log->user_name . ($log->user_role ? " ({$log->user_role})" : ''),
                    'user_role' => $log->user_role,
                    'action' => $formattedAction,
                    'action_category' => $log->action_category,
                    'details' => $log->description,
                    'severity' => $log->severity,
                ];
            })->toArray(),
            'pagination' => [
                'current_page' => $auditLogs->currentPage(),
                'last_page' => $auditLogs->lastPage(),
                'per_page' => $auditLogs->perPage(),
                'total' => $auditLogs->total(),
            ],
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'category' => $categoryFilter,
                'severity' => $severityFilter,
            ],
        ];
    }

    protected function reconciliationReport($dateFrom = null, $dateTo = null): array
    {
        $query = CashReconciliation::with('cashier')
            ->orderBy('reconciliation_date', 'desc');

        if ($dateFrom) {
            $query->whereDate('reconciliation_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('reconciliation_date', '<=', $dateTo);
        }

        $reconciliations = $query->paginate(50, ['*'], 'reconciliation_page');

        // Calculate summary statistics
        $allReconciliations = CashReconciliation::query()
            ->when($dateFrom, fn($q) => $q->whereDate('reconciliation_date', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->whereDate('reconciliation_date', '<=', $dateTo))
            ->get();

        $stats = [
            'total_count' => $allReconciliations->count(),
            'balanced_count' => $allReconciliations->where('variance', 0)->count(),
            'overage_count' => $allReconciliations->where('variance', '>', 0)->count(),
            'shortage_count' => $allReconciliations->where('variance', '<', 0)->count(),
            'total_expected' => $allReconciliations->sum('expected_cash'),
            'total_actual' => $allReconciliations->sum('actual_cash'),
            'total_overage' => $allReconciliations->where('variance', '>', 0)->sum('variance'),
            'total_shortage' => abs($allReconciliations->where('variance', '<', 0)->sum('variance')),
            'total_variance' => $allReconciliations->sum('variance'),
            'accuracy_rate' => $allReconciliations->count() > 0 
                ? round(($allReconciliations->where('variance', 0)->count() / $allReconciliations->count()) * 100, 1)
                : 0,
        ];

        return [
            'data' => $reconciliations->map(function ($rec) {
                return [
                    'id' => $rec->id,
                    'date' => $rec->reconciliation_date->toDateString(),
                    'cashier' => $rec->cashier->name,
                    'expected_cash' => $rec->expected_cash,
                    'actual_cash' => $rec->actual_cash,
                    'variance' => $rec->variance,
                    'status' => $rec->status,
                    'variance_type' => $rec->variance_type,
                    'transaction_count' => $rec->transaction_count,
                    'notes' => $rec->notes,
                    'created_at' => $rec->created_at->format('Y-m-d H:i:s'),
                ];
            })->toArray(),
            'stats' => $stats,
            'pagination' => [
                'current_page' => $reconciliations->currentPage(),
                'last_page' => $reconciliations->lastPage(),
                'per_page' => $reconciliations->perPage(),
                'total' => $reconciliations->total(),
            ],
        ];
    }

    private function getDateRange($period)
    {
        return match ($period) {
            'day' => [now()->startOfDay(), now()->endOfDay()],
            'week' => [now()->startOfWeek(), now()->endOfWeek()],
            'month' => [now()->startOfMonth(), now()->endOfMonth()],
            'year' => [now()->startOfYear(), now()->endOfYear()],
            default => [now()->startOfDay(), now()->endOfDay()],
        };
    }
}

