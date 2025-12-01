<?php

namespace App\Http\Controllers;

use App\Models\CashReconciliation;
use App\Models\Transaction;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashReconciliationController extends Controller
{
    public function __construct(
        protected AuditLogger $auditLogger
    ) {}

    /**
     * Display reconciliation history
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->role === 'admin';

        $reconciliations = CashReconciliation::with('cashier')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('cashier', function ($cashierQuery) use ($search) {
                        $cashierQuery->where('name', 'ilike', "%{$search}%");
                    })
                    ->orWhere('reconciliation_date', 'ilike', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'balanced') {
                    $query->where('variance', 0);
                } elseif ($status === 'overage') {
                    $query->where('variance', '>', 0);
                } elseif ($status === 'shortage') {
                    $query->where('variance', '<', 0);
                }
            })
            ->orderBy('reconciliation_date', 'desc')
            ->paginate(15);

        // Calculate summary stats for admin
        $stats = null;
        if ($isAdmin) {
            $stats = [
                'total_reconciliations' => CashReconciliation::count(),
                'balanced_count' => CashReconciliation::where('variance', 0)->count(),
                'overage_count' => CashReconciliation::where('variance', '>', 0)->count(),
                'shortage_count' => CashReconciliation::where('variance', '<', 0)->count(),
                'total_overage' => CashReconciliation::where('variance', '>', 0)->sum('variance'),
                'total_shortage' => abs(CashReconciliation::where('variance', '<', 0)->sum('variance')),
            ];
        }

        $viewPath = $isAdmin ? 'Admin/Reconciliation/AdminReconciliationList' : 'Cashier/Reconciliation/CashierReconciliationList';

        return Inertia::render($viewPath, [
            'reconciliations' => $reconciliations,
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats,
        ]);
    }

    /**
     * Show form for today's reconciliation
     */
    public function create()
    {
        $today = now()->toDateString();
        
        // Check if already reconciled today
        $existingReconciliation = CashReconciliation::where('reconciliation_date', $today)->first();
        
        if ($existingReconciliation) {
            return redirect()->route('cashier.reconciliation.index')
                ->with('error', 'Today has already been reconciled.');
        }

        // Calculate expected cash from today's paid transactions
        $todayTransactions = Transaction::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->where('payment_method', 'cash')
            ->get();

        $expectedCash = $todayTransactions->sum('net_total');
        $transactionCount = $todayTransactions->count();

        return Inertia::render('Cashier/Reconciliation/Create', [
            'expectedCash' => $expectedCash,
            'transactionCount' => $transactionCount,
            'reconciliationDate' => $today,
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
            return back()->with('error', 'Today has already been reconciled.');
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
            'cashier_id' => auth()->id(),
        ]);

        // Log the reconciliation
        $cashierName = auth()->user()->name;
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

        return redirect()->route('cashier.reconciliation.index')
            ->with('success', $message);
    }

    /**
     * Show reconciliation details
     */
    public function show(CashReconciliation $reconciliation)
    {
        $user = auth()->user();
        $isAdmin = $user->role === 'admin';

        $reconciliation->load('cashier');

        // Get transactions for that date
        $transactions = Transaction::whereDate('created_at', $reconciliation->reconciliation_date)
            ->where('payment_status', 'paid')
            ->where('payment_method', 'cash')
            ->with(['patient', 'cashier'])
            ->orderBy('created_at')
            ->get();

        $viewPath = $isAdmin ? 'Admin/Reconciliation/Show' : 'Cashier/Reconciliation/Show';

        return Inertia::render($viewPath, [
            'reconciliation' => $reconciliation,
            'transactions' => $transactions,
        ]);
    }
}
