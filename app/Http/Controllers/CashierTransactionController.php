<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Transaction;
use App\Models\TransactionEvent;
use App\Models\TransactionTest;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CashierTransactionController extends Controller
{
    protected $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function index(Request $request): Response
    {
        $transactions = $this->paginatedTransactions($request);

        $labTests = LabTest::active()
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category')
            ->map(function (Collection $tests) {
                return $tests->map(function (LabTest $test) {
                    return [
                        'id' => $test->id,
                        'name' => $test->name,
                        'price' => $test->price,
                        'code' => $test->code,
                    ];
                })->values();
            });

        $stats = [
            'todayTransactions' => Transaction::today()->count(),
            'pendingLab' => Transaction::where('lab_status', 'pending')->count(),
            'processingLab' => Transaction::where('lab_status', 'processing')->count(),
            'completedLab' => Transaction::where('lab_status', 'completed')->count(),
            'releasedLab' => Transaction::where('lab_status', 'released')->count(),
            'totalTests' => TransactionTest::count(),
        ];

        $nextQueueNumber = ((int) Transaction::today()->max('queue_number')) + 1;

        return Inertia::render('Cashier/Transactions/TransactionPage', [
            'labTests' => $labTests,
            'transactions' => $transactions,
            'stats' => $stats,
            'discountOptions' => $this->availableDiscounts(),
            'philHealthOptions' => $this->availablePhilHealthPlans(),
            'nextQueueNumber' => $nextQueueNumber,
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function checkDuplicateTests(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'test_ids' => ['required', 'array'],
            'test_ids.*' => ['required', 'exists:lab_tests,id'],
        ]);

        $duplicateTests = TransactionTest::whereHas('transaction', function ($query) use ($validated) {
            $query->where('patient_id', $validated['patient_id'])
                ->whereIn('lab_status', ['pending', 'processing']);
        })
            ->whereIn('lab_test_id', $validated['test_ids'])
            ->with('labTest')
            ->get()
            ->map(function ($transactionTest) {
                return [
                    'test_id' => $transactionTest->lab_test_id,
                    'test_name' => $transactionTest->test_name,
                    'status' => $transactionTest->status,
                ];
            });

        return response()->json(['duplicates' => $duplicateTests]);
    }

    public function history(Request $request): Response
    {
        $transactions = $this->paginatedTransactions($request, 50);

        $this->auditLogger->log(
            'view',
            'cashier_activities',
            'Viewed transaction history',
            ['page' => 'transaction_history'],
            'info'
        );

        return Inertia::render('Cashier/Transactions/History', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        // Convert MM/DD/YYYY to YYYY-MM-DD for validation
        if (isset($request->patient['date_of_birth']) && $request->patient['date_of_birth']) {
            $dob = $request->patient['date_of_birth'];
            // Check if format is MM/DD/YYYY
            if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dob, $matches)) {
                $request->merge([
                    'patient' => array_merge($request->patient, [
                        'date_of_birth' => $matches[3] . '-' . $matches[1] . '-' . $matches[2]
                    ])
                ]);
            }
        }

        $validated = $request->validate([
            'patient.id' => ['nullable', 'exists:patients,id'],
            'patient.first_name' => ['required_without:patient.id', 'string', 'max:255'],
            'patient.last_name' => ['required_without:patient.id', 'string', 'max:255'],
            'patient.middle_name' => ['nullable', 'string', 'max:255'],
            'patient.email' => ['nullable', 'email', 'max:255'],
            'patient.date_of_birth' => ['nullable', 'date', 'before:today'],
            'patient.age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'patient.gender' => ['nullable', 'string', 'max:30'],
            'patient.contact' => ['required', 'regex:/^09[0-9]{9}$/'],
            'patient.region_id' => ['nullable', 'exists:regions,region_id'],
            'patient.province_id' => ['nullable', 'exists:provinces,province_id'],
            'patient.city_id' => ['nullable', 'exists:cities,city_id'],
            'patient.barangay_code' => ['nullable', 'exists:barangays,code'],
            'patient.street' => ['nullable', 'string', 'max:255'],
            'tests' => ['required', 'array', 'min:1'],
            'tests.*.id' => ['required', 'exists:lab_tests,id'],
            'payment.method' => ['required', 'string', 'max:50'],
            'payment.amount_tendered' => ['required', 'numeric', 'min:0.01'],
            'discount' => ['nullable', 'array'],
            'discount.id' => ['nullable', 'string', 'max:100'],
            'discount.name' => ['nullable', 'string', 'max:255'],
            'discount.rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'philhealth' => ['nullable', 'array'],
            'philhealth.id' => ['nullable', 'string', 'max:100'],
            'philhealth.name' => ['nullable', 'string', 'max:255'],
            'philhealth.coverage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
        ], [
            'patient.first_name.required_without' => 'First name is required for new patients.',
            'patient.last_name.required_without' => 'Last name is required for new patients.',
            'patient.email.email' => 'Please enter a valid email address.',
            'patient.date_of_birth.date' => 'Please enter a valid date of birth in MM/DD/YYYY format.',
            'patient.date_of_birth.before' => 'Date of birth must be before today.',
            'patient.age.integer' => 'Age must be a number.',
            'patient.age.min' => 'Age must be at least 0.',
            'patient.age.max' => 'Age cannot exceed 120.',
            'patient.contact.required' => 'Phone number is required.',
            'patient.contact.regex' => 'Phone number must be in format 09XXXXXXXXX (11 digits starting with 09).',
            'patient.region_id.required' => 'Region is required.',
            'patient.province_id.required' => 'Province is required.',
            'patient.city_id.required' => 'City/Municipality is required.',
            'patient.barangay_code.required' => 'Barangay is required.',
            'patient.street.required' => 'Street address is required.',
            'tests.required' => 'Please select at least one lab test.',
            'tests.min' => 'Please select at least one lab test.',
            'tests.*.id.exists' => 'One or more selected tests are invalid.',
            'payment.method.required' => 'Payment method is required.',
            'payment.amount_tendered.required' => 'Amount paid is required.',
            'payment.amount_tendered.numeric' => 'Amount paid must be a valid number.',
            'payment.amount_tendered.min' => 'Amount paid must be greater than zero.',
            'discount.rate.numeric' => 'Discount rate must be a number.',
            'discount.rate.min' => 'Discount rate cannot be negative.',
            'discount.rate.max' => 'Discount rate cannot exceed 100%.',
            'philhealth.coverage.numeric' => 'PhilHealth coverage must be a number.',
            'philhealth.coverage.min' => 'PhilHealth coverage cannot be negative.',
            'philhealth.coverage.max' => 'PhilHealth coverage cannot exceed 100%.',
        ]);

        $user = $request->user();

        $transaction = DB::transaction(function () use ($validated, $user) {
            $patientData = $validated['patient'];
            $patient = $this->resolvePatient($patientData);

            $selectedTests = collect($validated['tests'])->pluck('id')->unique()->values();
            $labTests = LabTest::whereIn('id', $selectedTests)->get()->keyBy('id');

            if ($labTests->isEmpty()) {
                abort(422, 'No valid lab tests were selected.');
            }

            // Check for duplicate pending/processing tests for this patient
            if ($patient->id) {
                $existingTests = TransactionTest::whereHas('transaction', function ($query) use ($patient) {
                    $query->where('patient_id', $patient->id)
                        ->whereIn('lab_status', ['pending', 'processing']);
                })
                    ->whereIn('lab_test_id', $selectedTests)
                    ->with('labTest')
                    ->get();

                if ($existingTests->isNotEmpty()) {
                    $duplicateTestNames = $existingTests->pluck('test_name')->join(', ');
                    abort(422, "This patient already has pending/processing tests: {$duplicateTestNames}. Please check existing transactions.");
                }
            }

            $totalAmount = $labTests->sum('price');
            $discountSelection = $this->resolveDiscountSelection($validated['discount'] ?? null);
            $discountRate = $discountSelection['rate'] ?? 0;
            $discountName = $discountSelection['name'] ?? null;
            $discountAmount = round($totalAmount * ($discountRate / 100), 2);

            $philhealthSelection = $this->resolvePhilHealthSelection($validated['philhealth'] ?? null);
            $philhealthCoverage = $philhealthSelection['coverage'] ?? 0;
            $philhealthName = $philhealthSelection['name'] ?? null;

            // Calculate PhilHealth amount after discount
            $afterDiscount = $totalAmount - $discountAmount;
            $philhealthAmount = round($afterDiscount * ($philhealthCoverage / 100), 2);

            $netTotal = max($totalAmount - $discountAmount - $philhealthAmount, 0);
            $amountTendered = $validated['payment']['amount_tendered'] ?? $netTotal;
            $changeDue = max($amountTendered - $netTotal, 0);
            $balanceDue = max($netTotal - $amountTendered, 0);
            $paymentStatus = $balanceDue <= 0 ? 'paid' : 'pending';

            $patientMiddleName = $patientData['middle_name'] ?? null;

            $transaction = Transaction::create([
                'transaction_number' => $this->generateSequence('TXN'),
                'receipt_number' => $this->generateSequence('RCPT'),
                'queue_number' => ((int) Transaction::today()->max('queue_number')) + 1,
                'patient_id' => $patient?->id,
                'patient_first_name' => $patient->first_name,
                'patient_last_name' => $patient->last_name,
                'patient_middle_name' => $patientMiddleName,
                'patient_age' => $patientData['age'] ?? null,
                'patient_gender' => $patientData['gender'] ?? null,
                'patient_date_of_birth' => $patientData['date_of_birth'] ?? $patient->date_of_birth,
                'patient_contact' => $patientData['contact'] ?? $patient->contact_number,
                'region_id' => $patientData['region_id'] ?? $patient->region_id,
                'province_id' => $patientData['province_id'] ?? $patient->province_id,
                'city_id' => $patientData['city_id'] ?? $patient->city_id,
                'barangay_code' => $patientData['barangay_code'] ?? $patient->barangay_code,
                'patient_street' => $patientData['street'] ?? $patient->street,
                'payment_status' => $paymentStatus,
                'payment_method' => $validated['payment']['method'],
                'discount_name' => $discountName,
                'discount_rate' => $discountRate,
                'discount_amount' => $discountAmount,
                'philhealth_name' => $philhealthName,
                'philhealth_coverage' => $philhealthCoverage,
                'philhealth_amount' => $philhealthAmount,
                'net_total' => $netTotal,
                'total_amount' => $totalAmount,
                'amount_tendered' => $amountTendered,
                'change_due' => $changeDue,
                'balance_due' => $balanceDue,
                'lab_status' => 'pending',
                'notes' => $validated['notes'] ?? null,
                'cashier_id' => $user->id,
                'queued_at' => now(),
            ]);

            $labTests->each(function (LabTest $labTest) use ($transaction) {
                TransactionTest::create([
                    'transaction_id' => $transaction->id,
                    'lab_test_id' => $labTest->id,
                    'test_name' => $labTest->name,
                    'category' => $labTest->category,
                    'price' => $labTest->price,
                ]);
            });

            TransactionEvent::create([
                'transaction_id' => $transaction->id,
                'performed_by' => $user->id,
                'event_type' => 'created',
                'description' => 'New transaction recorded by cashier.',
                'metadata' => [
                    'payment_status' => $paymentStatus,
                    'total_amount' => $totalAmount,
                    'net_total' => $netTotal,
                    'discount' => [
                        'name' => $discountName,
                        'rate' => $discountRate,
                        'amount' => $discountAmount,
                    ],
                    'tests' => $labTests->pluck('name')->values()->all(),
                ],
            ]);

            // Log to audit system
            app(AuditLogger::class)->logTransactionCreated([
                'id' => $transaction->id,
                'transaction_number' => $transaction->transaction_number,
                'patient_name' => $transaction->patient_full_name,
                'tests' => $labTests->pluck('name')->toArray(),
                'total_amount' => $totalAmount,
                'discount_amount' => $discountAmount,
                'discount_name' => $discountName,
                'net_total' => $netTotal,
                'payment_method' => $validated['payment']['method'],
                'payment_status' => $paymentStatus,
            ]);

            return $transaction;
        });

        return redirect()
            ->route('cashier.transactions.index')
            ->with('success', "Transaction {$transaction->transaction_number} recorded successfully.");
    }

    public function show(Transaction $transaction): Response
    {
        $transaction->load(['tests', 'events.user', 'cashier', 'region', 'province', 'city', 'barangay']);

        return Inertia::render('Cashier/Transactions/Show', [
            'transaction' => $this->transformTransaction($transaction, includeDetails: true),
        ]);
    }

    protected function transformTransaction(Transaction $transaction, bool $includeDetails = false): array
    {
        $base = [
            'id' => $transaction->id,
            'transaction_number' => $transaction->transaction_number,
            'receipt_number' => $transaction->receipt_number,
            'queue_number' => $transaction->queue_number,
            'patient_name' => $transaction->patient_full_name,
            'patient_contact' => $transaction->patient_contact,
            'payment_status' => $transaction->payment_status,
            'lab_status' => $transaction->lab_status,
            'total_amount' => $transaction->total_amount,
            'net_total' => $transaction->net_total,
            'discount_amount' => $transaction->discount_amount,
            'discount_name' => $transaction->discount_name,
            'discount_rate' => $transaction->discount_rate,
            'created_at' => $transaction->created_at?->format('Y-m-d h:i:s A'),
            'tests' => $transaction->tests->map(fn(TransactionTest $test) => [
                'id' => $test->id,
                'name' => $test->test_name,
                'category' => $test->category,
                'price' => $test->price,
                'status' => $test->status,
            ]),
        ];

        if ($includeDetails) {
            $base['patient'] = [
                'first_name' => $transaction->patient_first_name,
                'last_name' => $transaction->patient_last_name,
                'middle_name' => $transaction->patient_middle_name,
                'age' => $transaction->patient_age,
                'gender' => $transaction->patient_gender,
                'contact' => $transaction->patient_contact,
                'date_of_birth' => $transaction->patient_date_of_birth,
                'address' => $transaction->patient_formatted_address,
                'region' => $transaction->region?->name,
                'province' => $transaction->province?->name,
                'city' => $transaction->city?->name,
                'barangay' => $transaction->barangay?->name,
                'street' => $transaction->patient_street,
            ];

            $base['payment'] = [
                'method' => $transaction->payment_method,
                'status' => $transaction->payment_status,
                'total_amount' => $transaction->total_amount,
                'net_total' => $transaction->net_total,
                'amount_tendered' => $transaction->amount_tendered,
                'change_due' => $transaction->change_due,
                'balance_due' => $transaction->balance_due,
            ];

            $base['discount'] = [
                'name' => $transaction->discount_name,
                'rate' => $transaction->discount_rate,
                'amount' => $transaction->discount_amount,
            ];

            $base['events'] = $transaction->events->map(fn(TransactionEvent $event) => [
                'id' => $event->id,
                'event_type' => $event->event_type,
                'description' => $event->description,
                'metadata' => $event->metadata,
                'performed_by' => $event->user?->name,
                'created_at' => $event->created_at?->diffForHumans(),
            ]);

            $base['cashier'] = $transaction->cashier?->only(['id', 'name']);
        }

        return $base;
    }

    protected function resolvePatient(array $patientData): Patient
    {
        if (!empty($patientData['id'])) {
            return Patient::findOrFail($patientData['id']);
        }

        // Check for existing patient with same name to prevent duplicates
        $existingPatient = Patient::where('first_name', 'ILIKE', $patientData['first_name'])
            ->where('last_name', 'ILIKE', $patientData['last_name'])
            ->where(function ($query) use ($patientData) {
                $query->whereNull('middle_name')
                    ->orWhere('middle_name', 'ILIKE', $patientData['middle_name'] ?? '');
            })
            ->first();

        if ($existingPatient) {
            // Return existing patient instead of creating duplicate
            return $existingPatient;
        }

        return Patient::create([
            'first_name' => $patientData['first_name'],
            'last_name' => $patientData['last_name'],
            'middle_name' => $patientData['middle_name'] ?? null,
            'email' => $patientData['email'] ?? null,
            'date_of_birth' => $patientData['date_of_birth'] ?? null,
            'age' => $patientData['age'] ?? null,
            'gender' => $patientData['gender'] ?? null,
            'contact_number' => $patientData['contact'] ?? null,
            'region_id' => $patientData['region_id'] ?? null,
            'province_id' => $patientData['province_id'] ?? null,
            'city_id' => $patientData['city_id'] ?? null,
            'barangay_code' => $patientData['barangay_code'] ?? null,
            'street' => $patientData['street'] ?? null,
            'birth_date' => $patientData['birth_date'] ?? null,
        ]);
    }

    protected function generateSequence(string $prefix): string
    {
        $today = now()->format('Ymd');
        $cacheKey = "sequence:{$prefix}:{$today}";

        // Use database to ensure unique sequence numbers
        $column = $prefix === 'TXN' ? 'transaction_number' : 'receipt_number';
        $latestNumber = Transaction::whereDate('created_at', now()->toDateString())
            ->where($column, 'like', "{$prefix}-{$today}-%")
            ->max($column);

        if ($latestNumber) {
            // Extract the sequence number from the latest transaction
            $sequence = (int) substr($latestNumber, -4) + 1;
        } else {
            $sequence = 1;
        }

        // Store in cache as backup
        cache()->put($cacheKey, $sequence, now()->addDay());

        return sprintf('%s-%s-%04d', $prefix, $today, $sequence);
    }

    protected function paginatedTransactions(Request $request, int $limit = 25)
    {
        $search = $request->input('search');

        return Transaction::with(['tests', 'cashier', 'region', 'province', 'city', 'barangay'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('transaction_number', 'like', "%{$search}%")
                        ->orWhere('receipt_number', 'like', "%{$search}%")
                        ->orWhere('patient_first_name', 'like', "%{$search}%")
                        ->orWhere('patient_last_name', 'like', "%{$search}%")
                        ->orWhereRaw("CONCAT(patient_first_name, ' ', patient_last_name) ILIKE ?", ["%{$search}%"])
                        ->orWhereRaw("CONCAT(patient_last_name, ' ', patient_first_name) ILIKE ?", ["%{$search}%"]);
                });
            })
            ->latest()
            ->paginate($limit)
            ->through(function (Transaction $transaction) {
                // Ensure lab_status is up to date based on current test statuses
                // Tests are already eager loaded, no need to refresh or reload
                $transaction->refreshLabStatus();
                return $this->transformTransaction($transaction);
            });
    }

    protected function availableDiscounts(): array
    {
        return \App\Models\Discount::active()
            ->orderBy('name')
            ->get()
            ->map(function ($discount) {
                return [
                    'id' => $discount->id,
                    'name' => $discount->name,
                    'rate' => $discount->rate,
                    'description' => $discount->description,
                ];
            })
            ->toArray();
    }

    protected function availablePhilHealthPlans(): array
    {
        return \App\Models\PhilHealthPlan::active()
            ->orderBy('name')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'coverage_rate' => $plan->coverage_rate,
                    'description' => $plan->description,
                ];
            })
            ->toArray();
    }

    protected function resolveDiscountSelection(?array $input): array
    {
        if (empty($input)) {
            return ['rate' => 0, 'name' => null];
        }

        $match = collect($this->availableDiscounts())
            ->firstWhere('id', $input['id'] ?? null);

        if ($match) {
            return $match;
        }

        return [
            'name' => $input['name'] ?? null,
            'rate' => (float) ($input['rate'] ?? 0),
        ];
    }

    protected function resolvePhilHealthSelection(?array $input): array
    {
        if (empty($input)) {
            return ['coverage' => 0, 'name' => null];
        }

        $match = collect($this->availablePhilHealthPlans())
            ->firstWhere('id', $input['id'] ?? null);

        if ($match) {
            return $match;
        }

        return [
            'name' => $input['name'] ?? null,
            'coverage' => (float) ($input['coverage'] ?? 0),
        ];
    }
}

