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

        // For cashier, check if today is reconciled and approved
        $isTodayReconciled = false;
        if (!$isAdmin) {
            $todayReconciliation = CashReconciliation::where('reconciliation_date', now()->toDateString())->first();
            $isTodayReconciled = $todayReconciliation && !$todayReconciliation->is_approved;
        }

        return Inertia::render($viewPath, [
            'reconciliations' => $reconciliations,
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats,
            'isTodayReconciled' => $isTodayReconciled,
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
        
        // Block if reconciled and not approved for correction
        if ($existingReconciliation && !$existingReconciliation->is_approved) {
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

        // Check if there's an approved reconciliation to replace
        $existingReconciliation = CashReconciliation::where('reconciliation_date', $today)->first();
        
        if ($existingReconciliation) {
            // If not approved, block the submission
            if (!$existingReconciliation->is_approved) {
                return back()->with('error', 'Today has already been reconciled.');
            }
            
            // If approved, log and delete it before creating new one
            $this->auditLogger->log(
                actionType: 'reconciliation_replaced',
                actionCategory: 'cash_management',
                description: "Approved reconciliation for {$today} replaced with new reconciliation by " . auth()->user()->name,
                metadata: [
                    'old_reconciliation_id' => $existingReconciliation->id,
                    'old_expected_cash' => $existingReconciliation->expected_cash,
                    'old_actual_cash' => $existingReconciliation->actual_cash,
                    'old_variance' => $existingReconciliation->variance,
                    'correction_reason' => $existingReconciliation->correction_reason,
                    'approved_by' => $existingReconciliation->approved_by,
                ],
                severity: 'info',
                entityType: 'CashReconciliation',
                entityId: $existingReconciliation->id
            );
            
            $existingReconciliation->delete();
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

    /**
     * Request correction for reconciliation (Cashier only)
     */
    public function requestCorrection(Request $request, CashReconciliation $reconciliation)
    {
        // Only allow if user is the cashier who created it or admin
        if ($reconciliation->cashier_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return back()->with('error', 'You can only request correction for your own reconciliations.');
        }

        // Check if already requested
        if ($reconciliation->correction_requested) {
            return back()->with('error', 'Correction has already been requested for this reconciliation.');
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $reconciliation->update([
            'correction_requested' => true,
            'correction_reason' => $validated['reason'],
            'correction_requested_at' => now(),
        ]);

        // Log the request
        $this->auditLogger->log(
            actionType: 'correction_requested',
            actionCategory: 'cash_management',
            description: "Correction requested by " . auth()->user()->name . " for reconciliation on {$reconciliation->reconciliation_date->format('M d, Y')}. Reason: {$validated['reason']}",
            metadata: [
                'reconciliation_id' => $reconciliation->id,
                'reconciliation_date' => $reconciliation->reconciliation_date,
                'reason' => $validated['reason'],
            ],
            severity: 'warning',
            entityType: 'CashReconciliation',
            entityId: $reconciliation->id
        );

        return back()->with('success', 'Correction request submitted. Admin will review your request.');
    }

    /**
     * Approve correction request (Admin only)
     */
    public function approveCorrection(CashReconciliation $reconciliation)
    {
        // Only admin can approve
        if (auth()->user()->role !== 'admin') {
            return back()->with('error', 'Only administrators can approve correction requests.');
        }

        if (!$reconciliation->correction_requested) {
            return back()->with('error', 'No correction request found for this reconciliation.');
        }

        $reconciliationDate = $reconciliation->reconciliation_date->format('M d, Y');
        $cashierName = $reconciliation->cashier->name;

        // Mark as approved
        $reconciliation->update([
            'is_approved' => true,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        // Log approval
        $this->auditLogger->log(
            actionType: 'correction_approved',
            actionCategory: 'cash_management',
            description: "Correction request approved for {$reconciliationDate} by admin " . auth()->user()->name . ". Cashier {$cashierName} can now re-reconcile.",
            metadata: [
                'reconciliation_id' => $reconciliation->id,
                'reconciliation_date' => $reconciliation->reconciliation_date,
                'cashier_id' => $reconciliation->cashier_id,
                'cashier_name' => $cashierName,
                'correction_reason' => $reconciliation->correction_reason,
                'approved_by' => auth()->user()->name,
            ],
            severity: 'info',
            entityType: 'CashReconciliation',
            entityId: $reconciliation->id
        );

        return back()->with('success', "Correction request approved. {$cashierName} can now re-reconcile for {$reconciliationDate}.");
    }

    /**
     * Delete reconciliation (Admin only)
     */
    public function destroy(CashReconciliation $reconciliation)
    {
        // Only admin can delete
        if (auth()->user()->role !== 'admin') {
            return back()->with('error', 'Only administrators can delete reconciliations.');
        }

        $reconciliationDate = $reconciliation->reconciliation_date->format('M d, Y');
        $cashierName = $reconciliation->cashier->name;
        $variance = $reconciliation->variance;

        // Log deletion with full details
        $this->auditLogger->log(
            actionType: 'reconciliation_deleted',
            actionCategory: 'cash_management',
            description: "Reconciliation for {$reconciliationDate} by {$cashierName} deleted by " . auth()->user()->name . ". Expected: ₱" . number_format($reconciliation->expected_cash, 2) . ", Actual: ₱" . number_format($reconciliation->actual_cash, 2) . ", Variance: ₱" . number_format($variance, 2),
            metadata: [
                'reconciliation_id' => $reconciliation->id,
                'reconciliation_date' => $reconciliation->reconciliation_date,
                'cashier_id' => $reconciliation->cashier_id,
                'cashier_name' => $cashierName,
                'expected_cash' => $reconciliation->expected_cash,
                'actual_cash' => $reconciliation->actual_cash,
                'variance' => $variance,
                'correction_requested' => $reconciliation->correction_requested,
                'correction_reason' => $reconciliation->correction_reason,
                'notes' => $reconciliation->notes,
            ],
            severity: 'critical',
            entityType: 'CashReconciliation',
            entityId: $reconciliation->id
        );

        $reconciliation->delete();

        return back()->with('success', "Reconciliation for {$reconciliationDate} has been deleted. Cashier can now re-reconcile.");
    }
}
