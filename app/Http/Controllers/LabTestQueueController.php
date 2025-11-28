<?php

namespace App\Http\Controllers;

use App\Models\TransactionTest;
use App\Models\Transaction;
use App\Models\ResultSubmission;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LabTestQueueController extends Controller
{
    protected $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function index(Request $request): Response
    {
        $pending = $this->getTestsByStatus('pending');
        $processing = $this->getTestsByStatus('processing');
        $completed = $this->getTestsByStatus('completed', 10);
        $released = $this->getTestsByStatus('released', 10);

        $stats = [
            'pending' => $pending['count'],
            'processing' => $processing['count'],
            'completed_today' => TransactionTest::where('status', 'completed')
                ->whereDate('updated_at', now()->toDateString())
                ->count(),
        ];

        return Inertia::render('Laboratory/LabTestQueue/Index', [
            'stats' => $stats,
            'tests' => [
                'pending' => $pending['items'],
                'processing' => $processing['items'],
                'completed' => $completed['items'],
                'released' => $released['items'],
                'full_history' => $this->transformCollection(
                    TransactionTest::with(['transaction', 'transaction.patient'])
                        ->latest()
                        ->take(25)
                        ->get()
                ),
            ],
        ]);
    }

    public function enterResults(TransactionTest $transactionTest): Response
    {
        $transactionTest->load(['transaction', 'transaction.patient']);

        return Inertia::render('Laboratory/LabTestQueue/EnterResults', [
            'test' => $this->transformTest($transactionTest, includeResults: true),
        ]);
    }

    protected function getTestsByStatus(string $status, int $limit = 15): array
    {
        $query = TransactionTest::with(['transaction', 'transaction.patient'])
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
        return $tests->map(fn(TransactionTest $test) => $this->transformTest($test));
    }

    protected function transformTest(TransactionTest $test, bool $includeResults = false): array
    {
        // Get current patient name from patients table, fallback to transaction snapshot
        $currentPatientName = $test->transaction?->patient
            ? $test->transaction->patient->first_name . ' ' . $test->transaction->patient->last_name
            : $test->transaction?->patient_full_name;

        $base = [
            'id' => $test->id,
            'transaction_id' => $test->transaction_id,
            'transaction_number' => $test->transaction->transaction_number ?? null,
            'patient_name' => $currentPatientName,
            'test_name' => $test->test_name,
            'category' => $test->category,
            'status' => $test->status,
            'queue_number' => $test->transaction?->queue_number,
            'cashier_remarks' => $test->transaction?->notes,
            'created_at' => $test->created_at?->toDateTimeString(),
        ];

        if ($includeResults) {
            $patient = $test->transaction?->patient;
            $base['result_values'] = $test->result_values;
            $base['result_notes'] = $test->result_notes;
            $base['transaction'] = [
                'transaction_number' => $test->transaction->transaction_number ?? null,
                'patient' => [
                    'name' => $patient ? $patient->first_name . ' ' . $patient->last_name : $test->transaction?->patient_full_name,
                    'age' => $patient?->age ?? $test->transaction?->patient_age,
                    'gender' => $patient?->gender ?? $test->transaction?->patient_gender,
                    'email' => $patient?->email ?? null,
                    'contact' => $patient?->contact_number ?? $test->transaction?->patient_contact,
                ],
                'created_at' => $test->transaction?->created_at?->toDayDateTimeString(),
            ];
        }

        return $base;
    }

    /**
     * Display patient results page - transactions with at least one completed test
     */
    public function patientResults(Request $request): Response
    {
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $perPage = $request->input('per_page', 20);

        // Get transactions where at least one test is completed
        $query = Transaction::with(['patient', 'tests'])
            ->whereHas('tests', function ($query) {
                $query->where('status', 'completed');
            });

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_number', 'ILIKE', "%{$search}%")
                    ->orWhere('patient_full_name', 'ILIKE', "%{$search}%")
                    ->orWhereHas('patient', function ($patientQuery) use ($search) {
                        $patientQuery->where('first_name', 'ILIKE', "%{$search}%")
                            ->orWhere('last_name', 'ILIKE', "%{$search}%")
                            ->orWhere('email', 'ILIKE', "%{$search}%");
                    });
            });
        }

        // Apply sorting
        if ($sortBy === 'patient_name') {
            $query->orderBy('patient_full_name', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $transactions = $query->paginate($perPage)
            ->through(function ($transaction) {
                $patient = $transaction->patient;
                return [
                    'id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'patient_name' => $patient
                        ? $patient->first_name . ' ' . $patient->last_name
                        : $transaction->patient_full_name,
                    'patient_email' => $patient?->email ?? 'No email',
                    'patient_age' => $patient?->age ?? $transaction->patient_age,
                    'patient_address' => $patient?->address ?? 'No address',
                    'created_at' => $transaction->created_at->format('M d, Y g:i A'),
                    'completed_tests_count' => $transaction->tests->where('status', 'completed')->count(),
                    'tests' => $transaction->tests->map(function ($test) {
                        return [
                            'id' => $test->id,
                            'test_name' => $test->test_name,
                            'status' => $test->status,
                            'result' => $test->result_values,
                            'result_notes' => $test->result_notes,
                        ];
                    }),
                ];
            });

        $this->auditLogger->log(
            'view',
            'lab_activities',
            'Viewed patient results page',
            ['page' => 'patient_results', 'search' => $search],
            'info'
        );

        return Inertia::render('Laboratory/LabTestQueue/PatientResults', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Send test results to patient
     */
    public function sendResults(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'documents.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        try {
            DB::beginTransaction();

            $transaction = Transaction::with(['patient', 'tests'])->findOrFail($request->transaction_id);

            // Check if all tests are completed
            $incompleteTests = $transaction->tests->filter(fn($test) => $test->status !== 'completed');

            if ($incompleteTests->count() > 0) {
                $this->auditLogger->log(
                    'failed_send',
                    'lab_activities',
                    'Attempted to send incomplete results',
                    [
                        'transaction_number' => $transaction->transaction_number,
                        'patient_name' => $transaction->patient ?
                            $transaction->patient->first_name . ' ' . $transaction->patient->last_name :
                            $transaction->patient_full_name,
                        'incomplete_tests' => $incompleteTests->pluck('test_name')->toArray(),
                    ],
                    'warning'
                );

                return back()->with('error', 'Cannot send results. Some tests are not completed yet.');
            }

            // Handle document uploads
            $documentPaths = [];
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $document) {
                    $path = $document->store('result_documents', 'public');
                    $documentPaths[] = [
                        'name' => $document->getClientOriginalName(),
                        'path' => $path,
                        'size' => $document->getSize(),
                    ];
                }
            }

            // Create result submission record
            $submission = ResultSubmission::create([
                'transaction_id' => $transaction->id,
                'sent_by' => auth()->id(),
                'sent_at' => now(),
                'submission_type' => 'full_results',
                'documents' => $documentPaths,
            ]);

            // Check if patient has email
            $patientEmail = $transaction->patient ? $transaction->patient->email : null;
            if (!$patientEmail) {
                DB::rollBack();
                return back()->with('error', 'Patient email not found. Cannot send results.');
            }

            // Send results email with attachments
            \Mail::to($patientEmail)->send(new \App\Mail\SendResultsMail($transaction, $documentPaths));

            // Update all tests to released status
            $transaction->tests()->update([
                'status' => 'released',
                'released_at' => now(),
            ]);

            // Refresh the transaction to get updated tests
            $transaction->refresh();
            
            // Update transaction lab_status to 'released' since all tests are now released
            $transaction->refreshLabStatus();

            // Log the action
            $patientName = $transaction->patient ?
                $transaction->patient->first_name . ' ' . $transaction->patient->last_name :
                $transaction->patient_full_name;

            // Log the status change to released
            $this->auditLogger->log(
                'status_change',
                'lab_activities',
                "Transaction status changed from 'completed' to 'released' - Results sent to patient {$patientName}",
                [
                    'transaction_id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'previous_status' => 'completed',
                    'new_status' => 'released',
                    'patient_name' => $patientName,
                    'patient_email' => $transaction->patient?->email,
                    'tests_released' => $transaction->tests->pluck('test_name')->toArray(),
                ],
                'info',
                'Transaction',
                $transaction->id
            );

            $this->auditLogger->log(
                'send_results',
                'lab_activities',
                "Sent test results to patient {$patientName}",
                [
                    'transaction_id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'patient_email' => $transaction->patient?->email,
                    'tests_count' => $transaction->tests->count(),
                    'documents_count' => count($documentPaths),
                ],
                'info',
                'Transaction',
                $transaction->id
            );

            DB::commit();

            $emailAddress = $transaction->patient ? $transaction->patient->email : 'patient email';
            return back()->with('success', "Results were sent to {$emailAddress}");

        } catch (\Exception $e) {
            DB::rollBack();

            $this->auditLogger->log(
                'error',
                'lab_activities',
                'Failed to send test results',
                [
                    'error' => $e->getMessage(),
                    'transaction_id' => $request->transaction_id,
                ],
                'error'
            );

            return back()->with('error', 'Failed to send results. Please try again.');
        }
    }

    /**
     * Send notification to patient that results are ready for pickup
     */
    public function notifyPatient(Transaction $transaction)
    {
        try {
            DB::beginTransaction();

            // Load relationships
            $transaction->load(['patient', 'tests']);

            // Check if all tests are completed
            $incompleteTests = $transaction->tests->filter(fn($test) => $test->status !== 'completed');

            if ($incompleteTests->count() > 0) {
                $this->auditLogger->log(
                    'failed_notification',
                    'lab_activities',
                    'Attempted to notify patient with incomplete results',
                    [
                        'transaction_number' => $transaction->transaction_number,
                        'patient_name' => $transaction->patient ?
                            $transaction->patient->first_name . ' ' . $transaction->patient->last_name :
                            $transaction->patient_full_name,
                        'incomplete_tests' => $incompleteTests->pluck('test_name')->toArray(),
                    ],
                    'warning'
                );

                return back()->with('error', 'Cannot notify patient. Some tests are not completed yet.');
            }

            // Check if patient has email
            $patientEmail = $transaction->patient ? $transaction->patient->email : null;
            if (!$patientEmail) {
                return back()->with('error', 'Patient email not found. Cannot send notification.');
            }

            // Send notification email
            \Mail::to($patientEmail)->send(new \App\Mail\NotifyPatientMail($transaction));

            // Create ResultSubmission record for history tracking
            ResultSubmission::create([
                'transaction_id' => $transaction->id,
                'sent_by' => auth()->id(),
                'sent_at' => now(),
                'submission_type' => 'notification', // Simple notification without PDF
                'documents' => [], // No documents for simple notification
            ]);

            // Update all tests to released status
            $transaction->tests()->update([
                'status' => 'released',
                'released_at' => now(),
            ]);

            // Log the action
            $patientName = $transaction->patient ?
                $transaction->patient->first_name . ' ' . $transaction->patient->last_name :
                $transaction->patient_full_name;

            $this->auditLogger->log(
                'notify_patient',
                'lab_activities',
                "Sent pickup notification to patient {$patientName}",
                [
                    'transaction_id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'patient_email' => $patientEmail,
                    'tests_count' => $transaction->tests->count(),
                    'tests' => $transaction->tests->pluck('test_name')->toArray(),
                ],
                'info',
                'Transaction',
                $transaction->id
            );

            DB::commit();

            return back()->with('success', "Pickup notification sent to {$patientEmail}");

        } catch (\Exception $e) {
            DB::rollBack();

            $this->auditLogger->log(
                'error',
                'lab_activities',
                'Failed to send patient notification',
                [
                    'error' => $e->getMessage(),
                    'transaction_id' => $transaction->id,
                ],
                'error'
            );

            return back()->with('error', 'Failed to send notification. Please try again.');
        }
    }

    /**
     * Display result history - all sent results
     */
    public function resultHistory(Request $request): Response
    {
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'sent_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $perPage = $request->input('per_page', 20);
        $submissionType = $request->input('submission_type', 'all'); // all, full_results, notification

        $query = ResultSubmission::with(['transaction.patient', 'transaction.tests', 'sentBy']);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('transaction', function ($transQuery) use ($search) {
                    $transQuery->where('transaction_number', 'ILIKE', "%{$search}%")
                        ->orWhere('patient_full_name', 'ILIKE', "%{$search}%")
                        ->orWhereHas('patient', function ($patientQuery) use ($search) {
                            $patientQuery->where('first_name', 'ILIKE', "%{$search}%")
                                ->orWhere('last_name', 'ILIKE', "%{$search}%")
                                ->orWhere('email', 'ILIKE', "%{$search}%");
                        });
                })->orWhereHas('sentBy', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'ILIKE', "%{$search}%");
                });
            });
        }

        // Filter by submission type
        if ($submissionType !== 'all') {
            $query->where('submission_type', $submissionType);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        $sentResults = $query->paginate($perPage)
            ->through(function ($submission) {
                $transaction = $submission->transaction;
                $patient = $transaction->patient;

                return [
                    'id' => $submission->id,
                    'transaction_number' => $transaction->transaction_number,
                    'patient_name' => $patient
                        ? $patient->first_name . ' ' . $patient->last_name
                        : $transaction->patient_full_name,
                    'patient_email' => $patient?->email ?? 'No email',
                    'patient_age' => $patient?->age ?? $transaction->patient_age,
                    'patient_address' => $patient?->address ?? 'No address',
                    'sent_at' => $submission->sent_at->format('M d, Y g:i A'),
                    'sent_by_name' => $submission->sentBy?->name ?? 'Unknown',
                    'submission_type' => $submission->submission_type,
                    'tests' => $transaction->tests->map(function ($test) {
                        return [
                            'test_name' => $test->test_name,
                            'result' => $test->result_values,
                            'result_notes' => $test->result_notes,
                            'status' => $test->status,
                        ];
                    }),
                    'documents' => collect($submission->documents)->map(function ($doc) {
                        return [
                            'name' => $doc['name'] ?? 'Document',
                            'size' => isset($doc['size']) ? round($doc['size'] / 1024, 2) . ' KB' : 'Unknown',
                            'url' => Storage::url($doc['path']),
                        ];
                    }),
                ];
            });

        $this->auditLogger->log(
            'view',
            'lab_activities',
            'Viewed result history',
            ['page' => 'result_history', 'search' => $search],
            'info'
        );

        return Inertia::render('Laboratory/LabTestQueue/ResultHistory', [
            'sentResults' => $sentResults,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'submission_type' => $submissionType,
            ],
        ]);
    }
}
