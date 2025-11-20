<?php

namespace App\Http\Controllers;

use App\Models\TransactionTest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabTestQueueController extends Controller
{
    public function index(Request $request): Response
    {
        $pending = $this->getTestsByStatus('pending');
        $inProgress = $this->getTestsByStatus('in_progress');
        $completed = $this->getTestsByStatus('completed', 10);

        $stats = [
            'pending' => $pending['count'],
            'in_progress' => $inProgress['count'],
            'completed_today' => TransactionTest::where('status', 'completed')
                ->whereDate('updated_at', now()->toDateString())
                ->count(),
        ];

        return Inertia::render('Laboratory/LabTestQueue/Index', [
            'stats' => $stats,
            'tests' => [
                'pending' => $pending['items'],
                'in_progress' => $inProgress['items'],
                'completed' => $completed['items'],
                'full_history' => $this->transformCollection(
                    TransactionTest::with('transaction')
                        ->latest()
                        ->take(25)
                        ->get()
                ),
            ],
        ]);
    }

    public function enterResults(TransactionTest $transactionTest): Response
    {
        $transactionTest->load('transaction');

        return Inertia::render('Laboratory/LabTestQueue/EnterResults', [
            'test' => $this->transformTest($transactionTest, includeResults: true),
        ]);
    }

    protected function getTestsByStatus(string $status, int $limit = 15): array
    {
        $query = TransactionTest::with('transaction')
            ->where('status', $status)
            ->orderBy('updated_at', 'desc');

        $countQuery = clone $query;

        return [
            'count' => $countQuery->count(),
            'items' => $this->transformCollection(
                $query->take($limit)->get()
            ),
        ];
    }

    protected function transformCollection($tests)
    {
        return $tests->map(fn (TransactionTest $test) => $this->transformTest($test));
    }

    protected function transformTest(TransactionTest $test, bool $includeResults = false): array
    {
        $base = [
            'id' => $test->id,
            'transaction_id' => $test->transaction_id,
            'transaction_number' => $test->transaction->transaction_number ?? null,
            'patient_name' => $test->transaction?->patient_full_name,
            'test_name' => $test->test_name,
            'category' => $test->category,
            'status' => $test->status,
            'queue_number' => $test->transaction?->queue_number,
            'created_at' => $test->created_at?->toDateTimeString(),
        ];

        if ($includeResults) {
            $base['result_values'] = $test->result_values;
            $base['result_notes'] = $test->result_notes;
            $base['transaction'] = [
                'transaction_number' => $test->transaction->transaction_number ?? null,
                'patient' => [
                    'name' => $test->transaction?->patient_full_name,
                    'age' => $test->transaction?->patient_age,
                    'gender' => $test->transaction?->patient_gender,
                    'contact' => $test->transaction?->patient_contact,
                ],
                'created_at' => $test->transaction?->created_at?->toDayDateTimeString(),
            ];
        }

        return $base;
    }
}
