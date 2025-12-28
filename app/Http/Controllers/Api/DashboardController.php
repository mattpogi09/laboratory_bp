<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardDataService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardDataService $dashboardDataService
    ) {
    }

    public function __invoke(Request $request)
    {
        $period = $request->input('period', 'day');
        $data = $this->dashboardDataService->build($period);

        return response()->json([
            'period' => $period,
            'stats' => $data['stats'],
            'pendingTasks' => $data['pendingTasks'],
            'lowStockItems' => $data['lowStockItems'],
            'revenueChartData' => $data['revenueChartData'],
            'testStatusData' => $data['testStatusData'],
            'dailyRevenue' => $data['dailyRevenue'],
            'topTests' => $data['topTests'],
            'alerts' => $data['alerts'],
        ]);
    }
}

