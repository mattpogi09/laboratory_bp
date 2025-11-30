<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\DashboardDataService;

class DashboardController extends Controller
{
  public function __construct(
    private readonly DashboardDataService $dashboardDataService
  ) {
  }

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
    $dashboardData = $this->dashboardDataService->build($period);

    return Inertia::render('Dashboard', [
      'stats' => [
        'totalRevenue' => number_format($dashboardData['stats']['totalRevenue'], 2),
        'revenueTrend' => $dashboardData['stats']['revenueTrend'],
        'patientsCount' => $dashboardData['stats']['patientsCount'],
        'patientsTrend' => $dashboardData['stats']['patientsTrend'],
        'lowStockItems' => $dashboardData['stats']['lowStockItems'],
        'pendingTests' => $dashboardData['stats']['pendingTests'],
      ],
      'period' => $period,
      'pendingTasks' => $dashboardData['pendingTasks'],
      'lowStockItems' => $dashboardData['lowStockItems'],
      'revenueChartData' => $dashboardData['revenueChartData'],
      'testStatusData' => $dashboardData['testStatusData'],
      'dailyRevenue' => $dashboardData['dailyRevenue'],
      'topTests' => $dashboardData['topTests']->map(function ($test) {
        return [
          'name' => $test['name'],
          'count' => $test['count'],
          'revenue' => number_format($test['revenue'], 2),
        ];
      }),
      'alerts' => $dashboardData['alerts'],
    ]);
  }
}
