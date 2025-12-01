<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransactionTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LabQueueController extends Controller
{
    public function summary()
    {
        $statusCounts = TransactionTest::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $upNext = TransactionTest::with(['transaction.patient'])
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at')
            ->take(10)
            ->get()
            ->map(fn ($test) => [
                'id' => $test->id,
                'patient' => $test->transaction->patient_full_name,
                'test' => $test->test_name,
                'status' => $test->status,
                'created_at' => $test->created_at->toDateTimeString(),
            ]);

        return response()->json([
            'counts' => [
                'pending' => (int) ($statusCounts['pending'] ?? 0),
                'processing' => (int) ($statusCounts['processing'] ?? 0),
                'completed' => (int) ($statusCounts['completed'] ?? 0),
                'released' => (int) ($statusCounts['released'] ?? 0),
            ],
            'up_next' => $upNext,
        ]);
    }

    public function index(Request $request)
    {
        $status = $request->input('status', 'pending');
        $perPage = (int) min($request->input('per_page', 15), 50);

        $tests = TransactionTest::with(['transaction.patient'])
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $tests->map(fn ($test) => [
                'id' => $test->id,
                'patient' => $test->transaction->patient_full_name,
                'test' => $test->test_name,
                'status' => $test->status,
                'price' => (float) $test->price,
                'created_at' => $test->created_at->toDateTimeString(),
            ]),
            'meta' => [
                'current_page' => $tests->currentPage(),
                'last_page' => $tests->lastPage(),
                'per_page' => $tests->perPage(),
                'total' => $tests->total(),
            ],
        ]);
    }
}

