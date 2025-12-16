<?php

namespace App\Http\Controllers;

use App\Models\TransactionEvent;
use App\Models\TransactionTest;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class LabResultController extends Controller
{
    public function update(Request $request, TransactionTest $transactionTest)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,processing,completed,released'],
            'result_values' => ['nullable', 'array'],
            'result_notes' => ['nullable', 'string'],
        ], [
            'status.required' => 'Status is required.',
            'status.in' => 'Please select a valid status.',
        ]);

        $oldResultValues = $transactionTest->result_values;
        $oldStatus = $transactionTest->status;
        $testName = $transactionTest->test_name;
        $patientName = $transactionTest->transaction->patient_full_name;

        $transactionTest->status = $validated['status'];
        $transactionTest->result_values = $validated['result_values'];
        $transactionTest->result_notes = $validated['result_notes'] ?? null;
        $transactionTest->performed_by = $request->user()->id;

        if ($validated['status'] === 'processing' && !$transactionTest->started_at) {
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

        // Log to audit system
        $auditLogger = app(AuditLogger::class);

        // Check if this is an amendment (result was already entered before)
        if ($oldResultValues && count($oldResultValues) > 0) {
            // This is an AMENDMENT
            $changes = [];
            foreach ($validated['result_values'] ?? [] as $key => $value) {
                $oldValue = $oldResultValues[$key] ?? null;
                if ($oldValue != $value) {
                    $changes[$key] = [
                        'from' => $oldValue,
                        'to' => $value,
                    ];
                }
            }

            if (!empty($changes)) {
                $statusChange = $oldStatus !== $validated['status']
                    ? "Status '{$oldStatus}' → '{$validated['status']}'."
                    : '';

                $auditLogger->logLabResultAmended(
                    $transactionTest->id,
                    $testName,
                    $patientName,
                    $changes,
                    $statusChange
                );
            } elseif ($oldStatus !== $validated['status']) {
                // Only status changed, no result values changed
                $auditLogger->logLabResultEntered(
                    $transactionTest->id,
                    $testName,
                    $patientName,
                    "Status '{$oldStatus}' → '{$validated['status']}'"
                );
            }
        } else {
            // First time entering results
            $statusInfo = $oldStatus !== $validated['status']
                ? " Status '{$oldStatus}' → '{$validated['status']}'"
                : '';

            $auditLogger->logLabResultEntered(
                $transactionTest->id,
                $testName,
                $patientName,
                $statusInfo
            );
        }

        return back()->with('success', 'Lab result updated successfully.');
    }
}
