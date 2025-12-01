<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CashReconciliation;
use App\Models\InventoryTransaction;
use App\Models\Transaction;
use App\Models\TransactionTest;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function overview()
    {
        $todayRevenue = Transaction::where('payment_status', 'paid')
            ->whereDate('created_at', today())
            ->sum('net_total');

        $weekRevenue = Transaction::where('payment_status', 'paid')
            ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->sum('net_total');

        $monthRevenue = Transaction::where('payment_status', 'paid')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('net_total');

        $outstandingBalance = Transaction::whereIn('payment_status', ['pending', 'partial'])
            ->sum('balance_due');

        $recentTransactions = Transaction::with(['patient'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($transaction) => [
                'id' => $transaction->id,
                'transaction_number' => $transaction->transaction_number,
                'patient' => $transaction->patient_full_name,
                'net_total' => $transaction->net_total,
                'payment_status' => $transaction->payment_status,
                'lab_status' => $transaction->lab_status,
                'created_at' => $transaction->created_at->toDateTimeString(),
            ]);

        $topServices = TransactionTest::selectRaw('test_name, COUNT(*) as total, SUM(price) as revenue')
            ->whereBetween('created_at', [now()->subDays(30), now()])
            ->groupBy('test_name')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(fn ($test) => [
                'name' => $test->test_name,
                'orders' => (int) $test->total,
                'revenue' => (float) $test->revenue,
            ]);

        return response()->json([
            'revenue' => [
                'today' => (float) $todayRevenue,
                'week' => (float) $weekRevenue,
                'month' => (float) $monthRevenue,
            ],
            'outstanding_balance' => (float) $outstandingBalance,
            'recent_transactions' => $recentTransactions,
            'top_services' => $topServices,
        ]);
    }

    public function financial(Request $request)
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $dateFrom = $validated['from'] ?? null;
        $dateTo = $validated['to'] ?? null;

        $transactionsQuery = Transaction::with('tests')->latest();

        if ($dateFrom) {
            $transactionsQuery->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $transactionsQuery->whereDate('created_at', '<=', $dateTo);
        }

        $transactions = $transactionsQuery->paginate(50);

        $financialRows = $transactions->map(function (Transaction $transaction) {
            return [
                'id' => $transaction->id,
                'date' => $transaction->created_at?->toDateString(),
                'patient' => $transaction->patient_full_name,
                'tests' => $transaction->tests->pluck('test_name')->implode(', '),
                'amount' => (float) $transaction->total_amount,
                'discount_amount' => (float) $transaction->discount_amount,
                'discount_name' => $transaction->discount_name,
                'net_amount' => (float) $transaction->net_total,
                'payment_method' => $transaction->payment_method,
                'payment_status' => $transaction->payment_status,
            ];
        });

        $totals = [
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

        return response()->json([
            'rows' => $financialRows,
            'totals' => [
                'revenue' => (float) $totals['revenue'],
                'discounts' => (float) $totals['discounts'],
                'transactions' => (int) $totals['transactions'],
            ],
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function inventoryLog(Request $request)
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $dateFrom = $validated['from'] ?? null;
        $dateTo = $validated['to'] ?? null;

        $query = InventoryTransaction::with(['item', 'user'])->latest();

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $inventoryLogs = $query->paginate(50);

        $data = $inventoryLogs->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'date' => $transaction->created_at->toDateString(),
                'transaction_code' => $transaction->transaction_code,
                'item' => $transaction->item->name,
                'type' => strtoupper($transaction->type),
                'quantity' => (int) $transaction->quantity,
                'previous_stock' => $transaction->previous_stock !== null ? (int) $transaction->previous_stock : null,
                'new_stock' => $transaction->new_stock !== null ? (int) $transaction->new_stock : null,
                'reason' => $transaction->reason,
                'performed_by' => $transaction->user->name,
            ];
        });

        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $inventoryLogs->currentPage(),
                'last_page' => $inventoryLogs->lastPage(),
                'per_page' => $inventoryLogs->perPage(),
                'total' => $inventoryLogs->total(),
            ],
        ]);
    }

    public function auditLog(Request $request)
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $dateFrom = $validated['from'] ?? null;
        $dateTo = $validated['to'] ?? null;

        $query = AuditLog::query()->recent()->latest('created_at');

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $auditLogs = $query->select([
            'id',
            'user_name',
            'user_role',
            'action_type',
            'action_category',
            'description',
            'severity',
            'created_at'
        ])->paginate(50);

        $data = $auditLogs->map(function ($log) {
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
        });

        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $auditLogs->currentPage(),
                'last_page' => $auditLogs->lastPage(),
                'per_page' => $auditLogs->perPage(),
                'total' => $auditLogs->total(),
            ],
        ]);
    }

    public function labReport(Request $request)
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $dateFrom = $validated['from'] ?? null;
        $dateTo = $validated['to'] ?? null;

        $labTestsQuery = TransactionTest::with(['transaction', 'performedBy'])->latest();

        if ($dateFrom) {
            $labTestsQuery->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $labTestsQuery->whereDate('created_at', '<=', $dateTo);
        }

        $labTests = $labTestsQuery->paginate(50);

        $stats = [
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

        $rows = $labTests->map(function (TransactionTest $test) {
            return [
                'id' => $test->id,
                'date' => $test->updated_at?->format('M d, Y'),
                'transaction_number' => $test->transaction?->transaction_number,
                'patient' => $test->transaction?->patient_full_name,
                'test_name' => $test->test_name,
                'performed_by' => $test->performedBy?->name ?? '—',
                'status' => $test->status,
            ];
        });

        return response()->json([
            'stats' => [
                'total' => (int) $stats['total'],
                'pending' => (int) $stats['pending'],
                'processing' => (int) $stats['processing'],
                'completed' => (int) $stats['completed'],
                'released' => (int) $stats['released'],
            ],
            'rows' => $rows,
            'pagination' => [
                'current_page' => $labTests->currentPage(),
                'last_page' => $labTests->lastPage(),
                'per_page' => $labTests->perPage(),
                'total' => $labTests->total(),
            ],
        ]);
    }

    public function reconciliation(Request $request)
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $dateFrom = $validated['from'] ?? null;
        $dateTo = $validated['to'] ?? null;

        $query = CashReconciliation::with('cashier')->latest('reconciliation_date');

        if ($dateFrom) {
            $query->whereDate('reconciliation_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('reconciliation_date', '<=', $dateTo);
        }

        $reconciliations = $query->get();

        // Calculate stats
        $balanced = $reconciliations->where('variance', 0)->count();
        $overage = $reconciliations->where('variance', '>', 0);
        $shortage = $reconciliations->where('variance', '<', 0);

        $stats = [
            'total' => $reconciliations->count(),
            'balanced' => $balanced,
            'overage' => $overage->count(),
            'shortage' => $shortage->count(),
            'total_overage_amount' => (float) $overage->sum('variance'),
            'total_shortage_amount' => (float) abs($shortage->sum('variance')),
        ];

        // Map to rows
        $rows = $reconciliations->map(function ($reconciliation) {
            return [
                'id' => $reconciliation->id,
                'date' => $reconciliation->reconciliation_date->format('Y-m-d'),
                'cashier' => $reconciliation->cashier->name,
                'expected_cash' => (float) $reconciliation->expected_cash,
                'actual_cash' => (float) $reconciliation->actual_cash,
                'variance' => (float) $reconciliation->variance,
                'status' => $reconciliation->status,
                'transaction_count' => (int) $reconciliation->transaction_count,
            ];
        });

        return response()->json([
            'stats' => $stats,
            'rows' => $rows,
        ]);
    }
}

