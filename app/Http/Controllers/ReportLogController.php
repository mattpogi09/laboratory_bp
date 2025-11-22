<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\Transaction;
use App\Models\TransactionTest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportLogController extends Controller
{
    public function index(Request $request): Response
    {
        $dateFrom = $request->input('from');
        $dateTo = $request->input('to');

        $transactionsQuery = Transaction::with('tests')
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

        $transactions = $transactionsQuery->take(100)->get();
        $labTests = $labTestsQuery->take(100)->get();

        $financialRows = $transactions->map(function (Transaction $transaction) {
            return [
                'id' => $transaction->id,
                'date' => $transaction->created_at?->toDateString(),
                'patient' => $transaction->patient_full_name,
                'tests' => $transaction->tests->pluck('test_name')->implode(', '),
                'amount' => $transaction->total_amount,
                'discount_amount' => $transaction->discount_amount,
                'discount_name' => $transaction->discount_name,
                'net_amount' => $transaction->net_total,
                'payment_method' => $transaction->payment_method,
                'payment_status' => $transaction->payment_status,
            ];
        });

        $financialTotals = [
            'revenue' => $transactions->sum('net_total'),
            'discounts' => $transactions->sum('discount_amount'),
            'transactions' => $transactions->count(),
        ];

        $labStats = [
            'total' => $labTests->count(),
            'pending' => $labTests->where('status', 'pending')->count(),
            'processing' => $labTests->where('status', 'processing')->count(),
            'completed' => $labTests->where('status', 'completed')->count(),
            'released' => $labTests->where('status', 'released')->count(),
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

        return Inertia::render('Configuration/ReportsLogs/Index', [
            'filters' => [
                'from' => $dateFrom,
                'to' => $dateTo,
            ],
            'financial' => [
                'rows' => $financialRows,
                'totals' => $financialTotals,
            ],
            'labReport' => [
                'stats' => $labStats,
                'rows' => $labRows,
            ],
            'inventoryLogs' => $this->inventoryLogs($dateFrom, $dateTo),
            'auditLogs' => $this->auditLogs(),
        ]);
    }

    protected function inventoryLogs($dateFrom = null, $dateTo = null): array
    {
        $query = InventoryTransaction::with(['item', 'user'])
            ->latest();

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query->take(100)
            ->get()
            ->map(function ($transaction) {
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
            })
            ->toArray();
    }

    protected function auditLogs(): array
    {
        return [
            [
                'timestamp' => now()->subHours(2)->toDateTimeString(),
                'user' => 'Admin',
                'action' => 'Report Viewed',
                'details' => 'Generated financial report',
                'severity' => 'info',
            ],
            [
                'timestamp' => now()->subHours(5)->toDateTimeString(),
                'user' => 'Jun (Cashier)',
                'action' => 'Transaction Created',
                'details' => 'Recorded transaction for Maria Santos',
                'severity' => 'info',
            ],
            [
                'timestamp' => now()->subDay()->toDateTimeString(),
                'user' => 'System',
                'action' => 'Inventory Threshold',
                'details' => 'Low stock alert: Blood Collection Tubes',
                'severity' => 'warning',
            ],
        ];
    }
}
