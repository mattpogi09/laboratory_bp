<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\Transaction;
use App\Models\TransactionTest;
use Illuminate\Support\Collection;

class DashboardDataService
{
    /**
     * Build the dashboard aggregates shared by the web and mobile surfaces.
     */
    public function build(string $period = 'day'): array
    {
        $dateRange = $this->getDateRange($period);
        $previousDateRange = $this->getPreviousDateRange($period);

        $totalRevenue = Transaction::whereBetween('created_at', $dateRange)
            ->where('payment_status', 'paid')
            ->sum('net_total');

        $previousRevenue = Transaction::whereBetween('created_at', $previousDateRange)
            ->where('payment_status', 'paid')
            ->sum('net_total');

        $revenueTrend = $this->calculateTrend($totalRevenue, $previousRevenue);

        $patientsCount = Transaction::whereBetween('created_at', $dateRange)
            ->distinct('patient_id')
            ->count('patient_id');

        $previousPatientsCount = Transaction::whereBetween('created_at', $previousDateRange)
            ->distinct('patient_id')
            ->count('patient_id');

        $patientsTrend = $this->calculateTrend($patientsCount, $previousPatientsCount);

        $pendingTests = TransactionTest::whereIn('status', ['pending', 'processing'])->count();

        $lowStockItems = InventoryItem::whereIn('status', ['low_stock', 'out_of_stock'])
            ->orderBy('current_stock')
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'current_stock' => $item->current_stock,
                'minimum_stock' => $item->minimum_stock,
                'unit' => $item->unit,
                'status' => $item->status,
            ]);

        $pendingTasks = TransactionTest::with(['transaction.patient'])
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'asc')
            ->take(10)
            ->get()
            ->map(fn ($test) => [
                'patient' => $test->transaction->patient_full_name,
                'test' => $test->test_name,
                'time' => $test->created_at->format('g:i A'),
                'status' => $test->status,
            ]);

        $revenueChartData = $this->getRevenueChartData($period);

        $testStatusData = [
            'pending' => TransactionTest::where('status', 'pending')->count(),
            'processing' => TransactionTest::where('status', 'processing')->count(),
            'completed' => TransactionTest::where('status', 'completed')->count(),
            'released' => TransactionTest::where('status', 'released')->count(),
        ];

        $dailyRevenue = $this->getDailyRevenue();

        $topTests = TransactionTest::selectRaw('test_name, COUNT(*) as count, SUM(price) as revenue')
            ->whereBetween('created_at', $dateRange)
            ->groupBy('test_name')
            ->orderByDesc('count')
            ->take(5)
            ->get()
            ->map(fn ($test) => [
                'name' => $test->test_name,
                'count' => (int) $test->count,
                'revenue' => (float) $test->revenue,
            ]);

        $alerts = $this->buildAlerts($pendingTests);

        return [
            'stats' => [
                'totalRevenue' => (float) $totalRevenue,
                'revenueTrend' => $revenueTrend,
                'patientsCount' => $patientsCount,
                'patientsTrend' => $patientsTrend,
                'lowStockItems' => $lowStockItems->count(),
                'pendingTests' => $pendingTests,
            ],
            'period' => $period,
            'pendingTasks' => $pendingTasks,
            'lowStockItems' => $lowStockItems,
            'revenueChartData' => $revenueChartData,
            'testStatusData' => $testStatusData,
            'dailyRevenue' => $dailyRevenue,
            'topTests' => $topTests,
            'alerts' => $alerts,
        ];
    }

    private function calculateTrend(float|int $current, float|int $previous): float
    {
        if ($previous > 0) {
            return round((($current - $previous) / $previous) * 100, 1);
        }

        return $current > 0 ? 100.0 : 0.0;
    }

    private function getDateRange(string $period): array
    {
        return match ($period) {
            'day' => [now()->startOfDay(), now()->endOfDay()],
            'week' => [now()->startOfWeek(), now()->endOfWeek()],
            'month' => [now()->startOfMonth(), now()->endOfMonth()],
            'year' => [now()->startOfYear(), now()->endOfYear()],
            default => [now()->startOfDay(), now()->endOfDay()],
        };
    }

    private function getPreviousDateRange(string $period): array
    {
        return match ($period) {
            'day' => [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()],
            'week' => [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()],
            'month' => [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()],
            'year' => [now()->subYear()->startOfYear(), now()->subYear()->endOfYear()],
            default => [now()->subDay()->startOfDay(), now()->subDay()->endOfDay()],
        };
    }

    private function getRevenueChartData(string $period): Collection
    {
        return match ($period) {
            'day' => $this->buildHourlyRevenue(),
            'week' => $this->buildWeeklyRevenue(),
            'month' => $this->buildMonthlyRevenue(),
            'year' => $this->buildYearlyRevenue(),
            default => collect(),
        };
    }

    private function buildHourlyRevenue(): Collection
    {
        $data = Transaction::where('payment_status', 'paid')
            ->whereDate('created_at', today())
            ->selectRaw('EXTRACT(HOUR FROM created_at) as hour, SUM(net_total) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->hour => $item->total]);

        return collect(range(0, 23))->map(fn ($hour) => [
            'label' => sprintf('%02d:00', $hour),
            'value' => (float) $data->get($hour, 0),
        ]);
    }

    private function buildWeeklyRevenue(): Collection
    {
        $startOfWeek = now()->startOfWeek();
        $data = Transaction::where('payment_status', 'paid')
            ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->selectRaw('created_at::date as date, SUM(net_total) as total')
            ->groupBy('date')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->date => $item->total]);

        return collect(range(0, 6))->map(function ($day) use ($startOfWeek, $data) {
            $date = $startOfWeek->copy()->addDays($day);
            return [
                'label' => $date->format('D'),
                'value' => (float) $data->get($date->format('Y-m-d'), 0),
            ];
        });
    }

    private function buildMonthlyRevenue(): Collection
    {
        $data = Transaction::where('payment_status', 'paid')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->selectRaw('EXTRACT(DAY FROM created_at) as day, SUM(net_total) as total')
            ->groupBy('day')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->day => $item->total]);

        $daysInMonth = now()->daysInMonth;

        return collect(range(1, $daysInMonth))->map(fn ($day) => [
            'label' => (string) $day,
            'value' => (float) $data->get($day, 0),
        ]);
    }

    private function buildYearlyRevenue(): Collection
    {
        $data = Transaction::where('payment_status', 'paid')
            ->whereBetween('created_at', [now()->startOfYear(), now()->endOfYear()])
            ->selectRaw('EXTRACT(MONTH FROM created_at) as month, SUM(net_total) as total')
            ->groupBy('month')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->month => $item->total]);

        return collect(range(1, 12))->map(fn ($month) => [
            'label' => date('M', mktime(0, 0, 0, $month, 1)),
            'value' => (float) $data->get($month, 0),
        ]);
    }

    private function getDailyRevenue(): Collection
    {
        $dailyRevenue = Transaction::where('payment_status', 'paid')
            ->whereBetween('created_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->selectRaw('created_at::date as date, SUM(net_total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->date => $item->total]);

        return collect(range(6, 0))->map(function ($daysAgo) use ($dailyRevenue) {
            $date = now()->subDays($daysAgo)->format('Y-m-d');
            return [
                'date' => now()->subDays($daysAgo)->format('M d'),
                'revenue' => (float) $dailyRevenue->get($date, 0),
            ];
        });
    }

    private function buildAlerts(int $pendingTests): array
    {
        $alerts = [];

        $criticalStock = InventoryItem::where('status', 'out_of_stock')->count();
        if ($criticalStock > 0) {
            $alerts[] = [
                'type' => 'critical',
                'message' => "{$criticalStock} items are out of stock!",
                'action' => 'Go to Inventory',
                'route' => 'inventory',
            ];
        }

        $lowStock = InventoryItem::where('status', 'low_stock')->count();
        if ($lowStock > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$lowStock} items are running low on stock.",
                'action' => 'View Items',
                'route' => 'inventory',
            ];
        }

        if ($pendingTests > 10) {
            $alerts[] = [
                'type' => 'info',
                'message' => "{$pendingTests} tests are pending processing.",
                'action' => 'View Tasks',
                'route' => 'reports-logs',
            ];
        }

        return $alerts;
    }
}

