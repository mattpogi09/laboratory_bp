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

        // Get full history with pagination (avoid duplicate query)
        $fullHistoryPaginated = TransactionTest::with(['transaction', 'transaction.patient'])
            ->latest()
            ->paginate(25, ['*'], 'history_page');

        return Inertia::render('Laboratory/LabTestQueue/LabTestQueuePage', [
            'stats' => $stats,
            'tests' => [
                'pending' => $pending['items'],
                'pending_pagination' => $pending['pagination'] ?? null,
                'processing' => $processing['items'],
                'processing_pagination' => $processing['pagination'] ?? null,
                'completed' => $completed['items'],
                'completed_pagination' => $completed['pagination'] ?? null,
                'released' => $released['items'],
                'released_pagination' => $released['pagination'] ?? null,
                'full_history' => $this->transformCollection($fullHistoryPaginated->items()),
                'full_history_pagination' => $fullHistoryPaginated->only(['current_page', 'last_page', 'per_page', 'total']),
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
            // Filter out tests from deactivated patients for non-admin users
            ->when(auth()->user()->role !== 'admin', function ($q) {
                $q->whereHas('transaction.patient', function ($patientQuery) {
                    $patientQuery->where('is_active', true);
                });
            })
            ->orderBy('updated_at', 'desc');

        $pageName = 'page_' . $status;
        $paginated = $query->paginate($limit, ['*'], $pageName);

        return [
            'count' => $paginated->total(),
            'items' => $this->transformCollection($paginated->items()),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ];
    }

    protected function transformCollection($tests)
    {
        return collect($tests)->map(fn(TransactionTest $test) => $this->transformTest($test))->all();
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
                    'date_of_birth' => $patient?->date_of_birth ?? $test->transaction?->patient_date_of_birth,
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

        // Get transactions where ALL tests are completed (not just at least one)
        // Only show patients when every single test is completed or released
        $query = Transaction::with([
            'patient', 
            'tests',
            'region',
            'province',
            'city',
            'barangay'
        ])
            // Must have at least one test
            ->whereHas('tests')
            // Must NOT have any pending or processing tests
            ->whereDoesntHave('tests', function ($query) {
                $query->whereIn('status', ['pending', 'processing']);
            });

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_number', 'ILIKE', "%{$search}%")
                    ->orWhere('patient_first_name', 'ILIKE', "%{$search}%")
                    ->orWhere('patient_last_name', 'ILIKE', "%{$search}%")
                    ->orWhereHas('patient', function ($patientQuery) use ($search) {
                        $patientQuery->where('first_name', 'ILIKE', "%{$search}%")
                            ->orWhere('last_name', 'ILIKE', "%{$search}%")
                            ->orWhere('email', 'ILIKE', "%{$search}%");
                    });
            });
        }

        // Apply sorting
        if ($sortBy === 'patient_name') {
            $query->orderBy('patient_last_name', $sortOrder)
                  ->orderBy('patient_first_name', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $transactions = $query->paginate($perPage)
            ->through(function ($transaction) {
                $patient = $transaction->patient;
                
                // Check if all tests are completed or released
                $allTests = $transaction->tests;
                $incompleteTests = $allTests->filter(function($test) {
                    $status = strtolower($test->status ?? '');
                    return $status !== 'completed' && $status !== 'released';
                });
                $allCompleted = $incompleteTests->count() === 0 && $allTests->count() > 0;
                
                // Get formatted address from transaction (includes all address components)
                $formattedAddress = $transaction->patient_formatted_address;
                if (empty($formattedAddress) || $formattedAddress === '') {
                    // Fallback to patient's formatted address if transaction doesn't have it
                    $formattedAddress = $patient?->formatted_address ?? 'No address';
                }
                
                return [
                    'id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'patient_name' => $patient
                        ? $patient->first_name . ' ' . $patient->last_name
                        : $transaction->patient_full_name,
                    'patient_email' => $patient?->email ?? 'No email',
                    'patient_age' => $patient?->age ?? $transaction->patient_age,
                    'patient_address' => $formattedAddress,
                    'created_at' => $transaction->created_at->format('M d, Y g:i A'),
                    'completed_tests_count' => $transaction->tests->whereIn('status', ['completed', 'released'])->count(),
                    'total_tests_count' => $transaction->tests->count(),
                    'all_completed' => $allCompleted,
                    'tests' => $transaction->tests->map(function ($test) {
                        return [
                            'id' => $test->id,
                            'test_name' => $test->test_name,
                            'status' => $test->status,
                            'result' => $test->result_values,
                            'result_value' => $test->result_values,
                            'normal_range' => $test->normal_range,
                            'result_notes' => $test->result_notes,
                            'images' => $test->result_images ? collect($test->result_images)->map(function ($img) {
                                return [
                                    'name' => $img['name'] ?? 'Image',
                                    'size' => isset($img['size']) ? round($img['size'] / 1024, 2) . ' KB' : 'Unknown',
                                    'url' => Storage::url($img['path']),
                                ];
                            })->toArray() : [],
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
            'test_documents.*.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        try {
            DB::beginTransaction();

            $transaction = Transaction::with([
                'patient',
                'tests',
                'region',
                'province',
                'city',
                'barangay'
            ])->findOrFail($request->transaction_id);
            
            // Refresh to get latest test statuses
            $transaction->refresh();
            $transaction->load(['tests', 'region', 'province', 'city', 'barangay']);

            // Ensure we have all tests for this transaction
            $allTests = $transaction->tests()->get();
            
            // Check if all tests are completed or released
            $incompleteTests = $allTests->filter(function($test) {
                $status = strtolower($test->status ?? '');
                return $status !== 'completed' && $status !== 'released';
            });

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
                        'incomplete_tests' => $incompleteTests->map(function($test) {
                            return [
                                'test_name' => $test->test_name,
                                'status' => $test->status,
                            ];
                        })->toArray(),
                    ],
                    'warning'
                );

                DB::rollBack();
                
                // Format incomplete tests for display
                $incompleteTestsList = $incompleteTests->map(function($test) {
                    return $test->test_name . ' (' . ucfirst($test->status) . ')';
                })->implode(', ');
                
                return back()->with('error', 'Cannot send results. The following tests are not completed yet: ' . $incompleteTestsList);
            }

            // Handle per-test document uploads
            $allDocuments = [];
            if ($request->has('test_documents')) {
                foreach ($request->test_documents as $testId => $documents) {
                    if (is_array($documents)) {
                        $testDocuments = [];
                        foreach ($documents as $document) {
                            if ($document && $document->isValid()) {
                                $path = $document->store('result_documents', 'public');
                                $testDocuments[] = [
                                    'name' => $document->getClientOriginalName(),
                                    'path' => $path,
                                    'size' => $document->getSize(),
                                ];
                                $allDocuments[] = [
                                    'name' => $document->getClientOriginalName(),
                                    'path' => $path,
                                    'size' => $document->getSize(),
                                ];
                            }
                        }
                        
                        // Update the transaction_test with images
                        if (!empty($testDocuments)) {
                            $test = TransactionTest::find($testId);
                            if ($test) {
                                $test->result_images = $testDocuments;
                                $test->save();
                            }
                        }
                    }
                }
            }

            // Create result submission record
            $submission = ResultSubmission::create([
                'transaction_id' => $transaction->id,
                'sent_by' => auth()->id(),
                'sent_at' => now(),
                'submission_type' => 'full_results',
                'documents' => $allDocuments,
            ]);

            // Check if patient has email
            $patientEmail = $transaction->patient ? $transaction->patient->email : null;
            if (!$patientEmail) {
                DB::rollBack();
                return back()->with('error', 'Patient email not found. Cannot send results.');
            }

            // Send results email with attachments
            try {
                \Mail::to($patientEmail)->send(new \App\Mail\SendResultsMail($transaction, $allDocuments));
                \Log::info('Email sent successfully', [
                    'to' => $patientEmail,
                    'transaction' => $transaction->transaction_number,
                ]);
            } catch (\Exception $mailException) {
                DB::rollBack();
                \Log::error('Failed to send email', [
                    'error' => $mailException->getMessage(),
                    'to' => $patientEmail,
                    'transaction' => $transaction->transaction_number,
                ]);
                throw new \Exception('Failed to send email: ' . $mailException->getMessage());
            }

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
                    'documents_count' => count($allDocuments),
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

            \Log::error('Send results error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to send results: ' . $e->getMessage());
        }
    }

    /**
     * Send notification to patient that results are ready for pickup
     */
    public function notifyPatient(Transaction $transaction)
    {
        try {
            DB::beginTransaction();

            // Refresh to get latest test statuses
            $transaction->refresh();
            $transaction->load(['patient', 'tests', 'region', 'province', 'city', 'barangay']);

            // Ensure we have all tests for this transaction
            $allTests = $transaction->tests()->get();
            
            // Check if all tests are completed or released
            $incompleteTests = $allTests->filter(function($test) {
                $status = strtolower($test->status ?? '');
                return $status !== 'completed' && $status !== 'released';
            });

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
                        'incomplete_tests' => $incompleteTests->map(function($test) {
                            return [
                                'test_name' => $test->test_name,
                                'status' => $test->status,
                            ];
                        })->toArray(),
                    ],
                    'warning'
                );

                DB::rollBack();
                
                // Format incomplete tests for display
                $incompleteTestsList = $incompleteTests->map(function($test) {
                    return $test->test_name . ' (' . ucfirst($test->status) . ')';
                })->implode(', ');
                
                return back()->with('error', 'Cannot notify patient. The following tests are not completed yet: ' . $incompleteTestsList);
            }

            // Check if patient has email
            $patientEmail = $transaction->patient ? $transaction->patient->email : null;
            if (!$patientEmail) {
                return back()->with('error', 'Patient email not found. Cannot send notification.');
            }

            // Send notification email
            try {
                \Mail::to($patientEmail)->send(new \App\Mail\NotifyPatientMail($transaction));
                \Log::info('Notification email sent successfully', [
                    'to' => $patientEmail,
                    'transaction' => $transaction->transaction_number,
                ]);
            } catch (\Exception $mailException) {
                DB::rollBack();
                \Log::error('Failed to send notification email', [
                    'error' => $mailException->getMessage(),
                    'to' => $patientEmail,
                    'transaction' => $transaction->transaction_number,
                ]);
                throw new \Exception('Failed to send notification email: ' . $mailException->getMessage());
            }

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

            \Log::error('Send notification error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to send notification: ' . $e->getMessage());
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
                        ->orWhere('patient_first_name', 'ILIKE', "%{$search}%")
                        ->orWhere('patient_last_name', 'ILIKE', "%{$search}%")
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
                
                // Get formatted address from transaction (includes all address components)
                $formattedAddress = $transaction->patient_formatted_address;
                if (empty($formattedAddress) || $formattedAddress === '') {
                    // Fallback to patient's formatted address if transaction doesn't have it
                    $formattedAddress = $patient?->formatted_address ?? 'No address';
                }

                return [
                    'id' => $submission->id,
                    'transaction_number' => $transaction->transaction_number,
                    'patient_name' => $patient
                        ? $patient->first_name . ' ' . $patient->last_name
                        : $transaction->patient_full_name,
                    'patient_email' => $patient?->email ?? 'No email',
                    'patient_age' => $patient?->age ?? $transaction->patient_age,
                    'patient_address' => $formattedAddress,
                    'sent_at' => $submission->sent_at->format('M d, Y g:i A'),
                    'sent_by_name' => $submission->sentBy?->name ?? 'Unknown',
                    'submission_type' => $submission->submission_type,
                    'tests' => $transaction->tests->map(function ($test) {
                        return [
                            'test_name' => $test->test_name,
                            'result' => $test->result_values,
                            'result_notes' => $test->result_notes,
                            'status' => $test->status,
                            'images' => $test->result_images ? collect($test->result_images)->map(function ($img) {
                                return [
                                    'name' => $img['name'] ?? 'Image',
                                    'size' => isset($img['size']) ? round($img['size'] / 1024, 2) . ' KB' : 'Unknown',
                                    'url' => Storage::url($img['path']),
                                ];
                            })->toArray() : [],
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
