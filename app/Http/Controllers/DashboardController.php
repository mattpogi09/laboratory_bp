<?php

namespace App\Http\Controllers;

use App\Models\CashReconciliation;
use App\Models\InventoryItem;
use App\Models\Patient;
use App\Models\Transaction;
use App\Models\TransactionTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
  public function index(Request $request)
  {
    // Role-based redirect
    $user = $request->user();
    if ($user->role === 'cashier') {
      return redirect()->route('cashier.transactions.index');
    }
    if ($user->role === 'lab_staff') {
      return redirect()->route('lab-test-queue');
    }

    $period = $request->input('period', 'day'); // day, week, month, year

    // Get date range based on period
    $dateRange = $this->getDateRange($period);
    $previousDateRange = $this->getPreviousDateRange($period);

    // Total Revenue
    $totalRevenue = Transaction::whereBetween('created_at', $dateRange)
      ->where('payment_status', 'paid')
      ->sum('net_total');

    // Previous period revenue for comparison
    $previousRevenue = Transaction::whereBetween('created_at', $previousDateRange)
      ->where('payment_status', 'paid')
      ->sum('net_total');

    // Calculate revenue trend
    $revenueTrend = $previousRevenue > 0
      ? round((($totalRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
      : ($totalRevenue > 0 ? 100 : 0);

    // Patients Count (based on period)
    $patientsCount = Transaction::whereBetween('created_at', $dateRange)
      ->distinct('patient_id')
      ->count('patient_id');

    // Previous period patients for comparison
    $previousPatientsCount = Transaction::whereBetween('created_at', $previousDateRange)
      ->distinct('patient_id')
      ->count('patient_id');

    // Calculate patients trend
    $patientsTrend = $previousPatientsCount > 0
      ? round((($patientsCount - $previousPatientsCount) / $previousPatientsCount) * 100, 1)
      : ($patientsCount > 0 ? 100 : 0);

    // Pending Tests
    $pendingTests = TransactionTest::where('status', 'pending')
      ->orWhere('status', 'processing')
      ->count();

    // Separate out-of-stock and low-stock items
    $outOfStockItems = InventoryItem::where('status', 'out_of_stock')
      ->orderBy('name')
      ->get()
      ->map(function ($item) {
        return [
          'id' => $item->id,
          'name' => $item->name,
          'current_stock' => $item->current_stock,
          'minimum_stock' => $item->minimum_stock,
          'unit' => $item->unit,
          'status' => $item->status,
        ];
      });

    $lowStockItems = InventoryItem::where('status', 'low_stock')
      ->orderBy('current_stock')
      ->get()
      ->map(function ($item) {
        return [
          'id' => $item->id,
          'name' => $item->name,
          'current_stock' => $item->current_stock,
          'minimum_stock' => $item->minimum_stock,
          'unit' => $item->unit,
          'status' => $item->status,
        ];
      });

    // Pending Tasks (Tests that need to be done)
    $pendingTasks = TransactionTest::with(['transaction' => function ($query) {
        $query->select('id', 'patient_first_name', 'patient_last_name');
      }])
      ->select('id', 'transaction_id', 'test_name', 'status', 'created_at')
      ->whereIn('status', ['pending', 'processing'])
      ->orderBy('created_at', 'asc')
      ->take(10)
      ->get()
      ->map(function ($test) {
        return [
          'patient' => $test->transaction->patient_full_name,
          'test' => $test->test_name,
          'time' => $test->created_at->format('g:i A'),
          'status' => $test->status,
        ];
      });

    // Revenue Chart Data
    $revenueChartData = $this->getRevenueChartData($period);

    // Test Status Distribution
    $testStatusData = [
      'pending' => TransactionTest::where('status', 'pending')->count(),
      'processing' => TransactionTest::where('status', 'processing')->count(),
      'completed' => TransactionTest::where('status', 'completed')->count(),
      'released' => TransactionTest::where('status', 'released')->count(),
    ];

    // Daily Revenue Trend (last 7 days)
    $dailyRevenue = Transaction::where('payment_status', 'paid')
      ->whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
      ->selectRaw('created_at::date as date, SUM(net_total) as total')
      ->groupBy('date')
      ->orderBy('date')
      ->get()
      ->mapWithKeys(function ($item) {
        return [$item->date => $item->total];
      });

    // Fill in missing dates with 0
    $last7Days = collect(range(6, 0))->map(function ($daysAgo) use ($dailyRevenue) {
      $date = now()->subDays($daysAgo)->format('Y-m-d');
      return [
        'date' => now()->subDays($daysAgo)->format('M d'),
        'revenue' => $dailyRevenue->get($date, 0),
      ];
    });

    // Top performing tests
    $topTests = TransactionTest::selectRaw('test_name, COUNT(*) as count, SUM(price) as revenue')
      ->whereBetween('created_at', $dateRange)
      ->groupBy('test_name')
      ->orderByDesc('count')
      ->take(5)
      ->get()
      ->map(function ($test) {
        return [
          'name' => $test->test_name,
          'count' => $test->count,
          'revenue' => number_format($test->revenue, 2),
        ];
      });

    // Critical alerts
    $alerts = [];
    $criticalStock = InventoryItem::where('status', 'out_of_stock')->count();
    if ($criticalStock > 0) {
      $alerts[] = [
        'type' => 'critical',
        'message' => "{$criticalStock} items are out of stock!",
        'action' => 'Go to Inventory',
        'route' => 'inventory'
      ];
    }

    $lowStock = InventoryItem::where('status', 'low_stock')->count();
    if ($lowStock > 0) {
      $alerts[] = [
        'type' => 'warning',
        'message' => "{$lowStock} items are running low on stock.",
        'action' => 'View Items',
        'route' => 'inventory'
      ];
    }

    if ($pendingTests > 10) {
      $alerts[] = [
        'type' => 'info',
        'message' => "{$pendingTests} tests are pending processing.",
        'action' => 'View Tasks',
        'route' => 'reports-logs'
      ];
    }

    // Check for cash discrepancies in recent reconciliations
    $recentDiscrepancies = CashReconciliation::where('variance', '!=', 0)
      ->where('created_at', '>=', now()->subDays(7))
      ->orderBy('reconciliation_date', 'desc')
      ->get();

    foreach ($recentDiscrepancies as $discrepancy) {
      $varianceType = $discrepancy->variance > 0 ? 'overage' : 'shortage';
      $alerts[] = [
        'type' => $varianceType,
        'message' => "Cash {$varianceType} of ₱" . number_format(abs($discrepancy->variance), 2) . " on " . $discrepancy->reconciliation_date->format('M d'),
        'action' => 'View Details',
        'route' => 'admin.reconciliation.show',
        'params' => ['reconciliation' => $discrepancy->id]
      ];
    }

    // Check if today hasn't been reconciled yet (after 5 PM)
    if (now()->hour >= 17) {
      $todayReconciled = CashReconciliation::where('reconciliation_date', now()->toDateString())->exists();
      if (!$todayReconciled) {
        $todayTransactions = Transaction::whereDate('created_at', now())
          ->where('payment_status', 'paid')
          ->where('payment_method', 'cash')
          ->count();
        
        if ($todayTransactions > 0) {
          $alerts[] = [
            'type' => 'info',
            'message' => "Today's cash has not been reconciled yet ({$todayTransactions} transactions).",
            'action' => 'View Reconciliation',
            'route' => 'admin.reconciliation.index'
          ];
        }
      }
    }

    return Inertia::render('Dashboard', [
      'stats' => [
        'totalRevenue' => number_format($totalRevenue, 2),
        'revenueTrend' => $revenueTrend,
        'previousRevenue' => number_format($previousRevenue, 2),
        'patientsCount' => $patientsCount,
        'patientsTrend' => $patientsTrend,
        'previousPatientsCount' => $previousPatientsCount,
        'lowStockItems' => count($lowStockItems),
        'outOfStockItems' => count($outOfStockItems),
        'pendingTests' => $pendingTests,
      ],
      'period' => $period,
      'pendingTasks' => $pendingTasks,
      'lowStockItems' => $lowStockItems,
      'outOfStockItems' => $outOfStockItems,
      'revenueChartData' => $revenueChartData,
      'testStatusData' => $testStatusData,
      'dailyRevenue' => $last7Days,
      'topTests' => $topTests,
      'alerts' => $alerts,
    ]);
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

  private function getPreviousDateRange($period)
  {
    return match ($period) {
      'day' => [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()],
      'week' => [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()],
      'month' => [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()],
      'year' => [now()->subYear()->startOfYear(), now()->subYear()->endOfYear()],
      default => [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()],
    };
  }

  private function getRevenueChartData($period)
  {
    switch ($period) {
      case 'day':
        // Hourly breakdown for today
        $data = Transaction::where('payment_status', 'paid')
          ->whereDate('created_at', today())
          ->selectRaw('EXTRACT(HOUR FROM created_at) as hour, SUM(net_total) as total')
          ->groupBy('hour')
          ->orderBy('hour')
          ->get()
          ->mapWithKeys(fn($item) => [$item->hour => $item->total]);

        return collect(range(0, 23))->map(function ($hour) use ($data) {
          return [
            'label' => sprintf('%02d:00', $hour),
            'value' => $data->get($hour, 0),
          ];
        })->values();

      case 'week':
        // Daily breakdown for this week
        $startOfWeek = now()->startOfWeek();
        $data = Transaction::where('payment_status', 'paid')
          ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
          ->selectRaw('created_at::date as date, SUM(net_total) as total')
          ->groupBy('date')
          ->get()
          ->mapWithKeys(fn($item) => [$item->date => $item->total]);

        return collect(range(0, 6))->map(function ($day) use ($startOfWeek, $data) {
          $date = $startOfWeek->copy()->addDays($day);
          return [
            'label' => $date->format('D'),
            'value' => $data->get($date->format('Y-m-d'), 0),
          ];
        })->values();

      case 'month':
        // Daily breakdown for this month
        $data = Transaction::where('payment_status', 'paid')
          ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
          ->selectRaw('EXTRACT(DAY FROM created_at) as day, SUM(net_total) as total')
          ->groupBy('day')
          ->get()
          ->mapWithKeys(fn($item) => [$item->day => $item->total]);

        $daysInMonth = now()->daysInMonth;
        return collect(range(1, $daysInMonth))->map(function ($day) use ($data) {
          return [
            'label' => (string) $day,
            'value' => $data->get($day, 0),
          ];
        })->values();

      case 'year':
        // Monthly breakdown for this year
        $data = Transaction::where('payment_status', 'paid')
          ->whereBetween('created_at', [now()->startOfYear(), now()->endOfYear()])
          ->selectRaw('EXTRACT(MONTH FROM created_at) as month, SUM(net_total) as total')
          ->groupBy('month')
          ->get()
          ->mapWithKeys(fn($item) => [$item->month => $item->total]);

        return collect(range(1, 12))->map(function ($month) use ($data) {
          return [
            'label' => date('M', mktime(0, 0, 0, $month, 1)),
            'value' => $data->get($month, 0),
          ];
        })->values();

      default:
        return collect([]);
    }
  }
}
