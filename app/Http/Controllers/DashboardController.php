<?php

namespace App\Http\Controllers;

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

    // Total Revenue
    $totalRevenue = Transaction::whereBetween('created_at', $dateRange)
      ->where('payment_status', 'paid')
      ->sum('net_total');

    // Patients Today
    $patientsToday = Transaction::whereDate('created_at', today())
      ->distinct('patient_id')
      ->count('patient_id');

    // Pending Tests
    $pendingTests = TransactionTest::where('status', 'pending')
      ->orWhere('status', 'processing')
      ->count();

    // Low Stock Items - Get items that are low stock or out of stock
    $lowStockItems = InventoryItem::whereIn('status', ['low_stock', 'out_of_stock'])
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
    $pendingTasks = TransactionTest::with(['transaction.patient'])
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

    return Inertia::render('Dashboard', [
      'stats' => [
        'totalRevenue' => number_format($totalRevenue, 2),
        'patientsToday' => $patientsToday,
        'lowStockItems' => count($lowStockItems),
        'pendingTests' => $pendingTests,
      ],
      'period' => $period,
      'pendingTasks' => $pendingTasks,
      'lowStockItems' => $lowStockItems,
      'revenueChartData' => $revenueChartData,
      'testStatusData' => $testStatusData,
      'dailyRevenue' => $last7Days,
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
