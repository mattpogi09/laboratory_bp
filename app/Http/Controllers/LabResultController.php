<?php

namespace App\Http\Controllers;

use App\Models\TransactionEvent;
use App\Models\TransactionTest;
use Illuminate\Http\Request;

class LabResultController extends Controller
{
    public function update(Request $request, TransactionTest $transactionTest)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,in_progress,completed'],
            'result_values' => ['nullable', 'array'],
            'result_notes' => ['nullable', 'string'],
        ]);

        $transactionTest->status = $validated['status'];
        $transactionTest->result_values = $validated['result_values'];
        $transactionTest->result_notes = $validated['result_notes'] ?? null;
        $transactionTest->performed_by = $request->user()->id;

        if ($validated['status'] === 'in_progress' && !$transactionTest->started_at) {
            $transactionTest->started_at = now();
        }

        if ($validated['status'] === 'completed') {
            $transactionTest->completed_at = now();
        }

        $transactionTest->save();

        $transaction = $transactionTest->transaction;
        $transaction->refreshLabStatus();

        TransactionEvent::create([
            'transaction_id' => $transaction->id,
            'performed_by' => $request->user()->id,
            'event_type' => 'lab_update',
            'description' => "Lab test {$transactionTest->test_name} updated.",
            'metadata' => [
                'status' => $transactionTest->status,
            ],
        ]);

        return back()->with('success', 'Lab result updated successfully.');
    }
}
