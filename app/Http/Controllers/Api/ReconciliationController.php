<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashReconciliation;
use App\Models\Transaction;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class ReconciliationController extends Controller
{
    public function __construct(
        protected AuditLogger $auditLogger
    ) {}

    /**
     * Get reconciliation list with pagination
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = (int) min($request->input('per_page', 20), 50);
        
        $query = CashReconciliation::with('cashier:id,name,email');

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('cashier', function ($cashierQuery) use ($search) {
                    $cashierQuery->where('name', 'ILIKE', "%{$search}%");
                })
                ->orWhereRaw("TO_CHAR(reconciliation_date, 'YYYY-MM-DD') ILIKE ?", ["%{$search}%"]);
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            if ($status === 'balanced') {
                $query->where('variance', 0);
            } elseif ($status === 'overage') {
                $query->where('variance', '>', 0);
            } elseif ($status === 'shortage') {
                $query->where('variance', '<', 0);
            }
        }

        $reconciliations = $query->orderBy('reconciliation_date', 'desc')
            ->paginate($perPage);

        // Calculate summary stats for admin
        $stats = null;
        if ($user->role === 'admin') {
            $stats = [
                'total_reconciliations' => CashReconciliation::count(),
                'balanced_count' => CashReconciliation::where('variance', 0)->count(),
                'overage_count' => CashReconciliation::where('variance', '>', 0)->count(),
                'shortage_count' => CashReconciliation::where('variance', '<', 0)->count(),
                'total_overage' => (float) CashReconciliation::where('variance', '>', 0)->sum('variance'),
                'total_shortage' => (float) abs(CashReconciliation::where('variance', '<', 0)->sum('variance')),
            ];
        }

        return response()->json([
            'data' => $reconciliations->map(function ($rec) {
                return [
                    'id' => $rec->id,
                    'reconciliation_date' => $rec->reconciliation_date->format('Y-m-d'),
                    'expected_cash' => (float) $rec->expected_cash,
                    'actual_cash' => (float) $rec->actual_cash,
                    'variance' => (float) $rec->variance,
                    'status' => $rec->status,
                    'variance_type' => $rec->variance_type,
                    'transaction_count' => $rec->transaction_count,
                    'notes' => $rec->notes,
                    'cashier' => $rec->cashier ? [
                        'id' => $rec->cashier->id,
                        'name' => $rec->cashier->name,
                        'email' => $rec->cashier->email,
                    ] : null,
                    'created_at' => $rec->created_at->toDateTimeString(),
                ];
            }),
            'stats' => $stats,
            'current_page' => $reconciliations->currentPage(),
            'last_page' => $reconciliations->lastPage(),
            'per_page' => $reconciliations->perPage(),
            'total' => $reconciliations->total(),
        ]);
    }

    /**
     * Get reconciliation details
     */
    public function show($id)
    {
        $reconciliation = CashReconciliation::with('cashier:id,name,email')->findOrFail($id);

        // Get transactions for that date
        $transactions = Transaction::whereDate('created_at', $reconciliation->reconciliation_date)
            ->where('payment_status', 'paid')
            ->where('payment_method', 'cash')
            ->with(['patient:id,first_name,last_name', 'cashier:id,name'])
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'reconciliation' => [
                'id' => $reconciliation->id,
                'reconciliation_date' => $reconciliation->reconciliation_date->format('Y-m-d'),
                'expected_cash' => (float) $reconciliation->expected_cash,
                'actual_cash' => (float) $reconciliation->actual_cash,
                'variance' => (float) $reconciliation->variance,
                'status' => $reconciliation->status,
                'variance_type' => $reconciliation->variance_type,
                'transaction_count' => $reconciliation->transaction_count,
                'notes' => $reconciliation->notes,
                'cashier' => $reconciliation->cashier ? [
                    'id' => $reconciliation->cashier->id,
                    'name' => $reconciliation->cashier->name,
                    'email' => $reconciliation->cashier->email,
                ] : null,
                'created_at' => $reconciliation->created_at->toDateTimeString(),
            ],
            'transactions' => $transactions->map(function ($trans) {
                return [
                    'id' => $trans->id,
                    'transaction_number' => $trans->transaction_number,
                    'net_total' => (float) $trans->net_total,
                    'payment_method' => $trans->payment_method,
                    'payment_status' => $trans->payment_status,
                    'patient' => $trans->patient ? [
                        'id' => $trans->patient->id,
                        'name' => $trans->patient->first_name . ' ' . $trans->patient->last_name,
                    ] : null,
                    'cashier' => $trans->cashier ? [
                        'id' => $trans->cashier->id,
                        'name' => $trans->cashier->name,
                    ] : null,
                    'created_at' => $trans->created_at->toDateTimeString(),
                ];
            }),
        ]);
    }

    /**
     * Get data for creating today's reconciliation
     */
    public function create(Request $request)
    {
        $today = now()->toDateString();
        
        // Check if already reconciled today
        $existingReconciliation = CashReconciliation::where('reconciliation_date', $today)->first();
        
        if ($existingReconciliation) {
            return response()->json([
                'message' => 'Today has already been reconciled.',
                'already_reconciled' => true,
            ], 400);
        }

        // Calculate expected cash from today's paid transactions
        $todayTransactions = Transaction::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->where('payment_method', 'cash')
            ->get();

        $expectedCash = $todayTransactions->sum('net_total');
        $transactionCount = $todayTransactions->count();

        return response()->json([
            'expected_cash' => (float) $expectedCash,
            'transaction_count' => $transactionCount,
            'reconciliation_date' => $today,
        ]);
    }

    /**
     * Store reconciliation record
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'actual_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $today = now()->toDateString();

        // Check if already reconciled
        $exists = CashReconciliation::where('reconciliation_date', $today)->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Today has already been reconciled.',
            ], 400);
        }

        // Calculate expected cash
        $expectedCash = Transaction::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->where('payment_method', 'cash')
            ->sum('net_total');

        $transactionCount = Transaction::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->where('payment_method', 'cash')
            ->count();

        // Calculate variance (actual - expected)
        $variance = $validated['actual_cash'] - $expectedCash;

        $reconciliation = CashReconciliation::create([
            'reconciliation_date' => $today,
            'expected_cash' => $expectedCash,
            'actual_cash' => $validated['actual_cash'],
            'variance' => $variance,
            'transaction_count' => $transactionCount,
            'notes' => $validated['notes'],
            'cashier_id' => $request->user()->id,
        ]);

        // Log the reconciliation
        $cashierName = $request->user()->name;
        $varianceDisplay = $variance == 0 
            ? 'balanced' 
            : "{$reconciliation->variance_type}: ₱" . number_format(abs($variance), 2);
        
        $this->auditLogger->log(
            actionType: 'cash_reconciliation_created',
            actionCategory: 'cash_management',
            description: "Cash reconciliation completed by {$cashierName}. Expected: ₱" . number_format($expectedCash, 2) . ", Counted: ₱" . number_format($validated['actual_cash'], 2) . ", Variance: {$varianceDisplay}, Status: {$reconciliation->status}",
            metadata: [
                'reconciliation_id' => $reconciliation->id,
                'expected_amount' => $expectedCash,
                'counted_amount' => $validated['actual_cash'],
                'variance' => $variance,
                'variance_type' => $reconciliation->variance_type,
                'status' => $reconciliation->status,
                'transaction_count' => $transactionCount,
                'notes' => $validated['notes'],
            ],
            severity: $variance == 0 ? 'info' : 'warning',
            entityType: 'CashReconciliation',
            entityId: $reconciliation->id
        );

        $message = $variance == 0 
            ? 'Cash reconciliation completed. Cash is balanced!' 
            : "Cash reconciliation completed. {$reconciliation->variance_type}: ₱" . number_format(abs($variance), 2);

        return response()->json([
            'message' => $message,
            'reconciliation' => [
                'id' => $reconciliation->id,
                'status' => $reconciliation->status,
                'variance' => (float) $variance,
            ],
        ], 201);
    }
}
