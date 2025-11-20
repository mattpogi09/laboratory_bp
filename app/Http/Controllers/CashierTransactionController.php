<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use App\Models\Patient;
use App\Models\Transaction;
use App\Models\TransactionEvent;
use App\Models\TransactionTest;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CashierTransactionController extends Controller
{
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
            'inProgressLab' => Transaction::where('lab_status', 'in_progress')->count(),
            'completedToday' => Transaction::where('lab_status', 'completed')
                ->whereDate('updated_at', now()->toDateString())
                ->count(),
        ];

        $nextQueueNumber = ((int) Transaction::today()->max('queue_number')) + 1;

        return Inertia::render('Cashier/Transactions/Index', [
            'labTests' => $labTests,
            'transactions' => $transactions,
            'stats' => $stats,
            'discountOptions' => $this->availableDiscounts(),
            'nextQueueNumber' => $nextQueueNumber,
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function history(Request $request): Response
    {
        $transactions = $this->paginatedTransactions($request, 50);

        return Inertia::render('Cashier/Transactions/History', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient.id' => ['nullable', 'exists:patients,id'],
            'patient.first_name' => ['required_without:patient.id', 'string', 'max:255'],
            'patient.last_name' => ['required_without:patient.id', 'string', 'max:255'],
            'patient.middle_name' => ['nullable', 'string', 'max:255'],
            'patient.age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'patient.gender' => ['nullable', 'string', 'max:30'],
            'patient.contact' => ['nullable', 'string', 'max:50'],
            'patient.address' => ['nullable', 'string', 'max:255'],
            'tests' => ['required', 'array', 'min:1'],
            'tests.*.id' => ['required', 'exists:lab_tests,id'],
            'payment.method' => ['required', 'string', 'max:50'],
            'payment.amount_tendered' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'array'],
            'discount.id' => ['nullable', 'string', 'max:100'],
            'discount.name' => ['nullable', 'string', 'max:255'],
            'discount.rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
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

            $totalAmount = $labTests->sum('price');
            $discountSelection = $this->resolveDiscountSelection($validated['discount'] ?? null);
            $discountRate = $discountSelection['rate'] ?? 0;
            $discountName = $discountSelection['name'] ?? null;
            $discountAmount = round($totalAmount * ($discountRate / 100), 2);
            $netTotal = max($totalAmount - $discountAmount, 0);
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
                'patient_contact' => $patientData['contact'] ?? $patient->contact_number,
                'patient_address' => $patientData['address'] ?? $patient->address,
                'payment_status' => $paymentStatus,
                'payment_method' => $validated['payment']['method'],
                'discount_name' => $discountName,
                'discount_rate' => $discountRate,
                'discount_amount' => $discountAmount,
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

            return $transaction;
        });

        return redirect()
            ->route('cashier.transactions.index')
            ->with('success', "Transaction {$transaction->transaction_number} recorded successfully.");
    }

    public function show(Transaction $transaction): Response
    {
        $transaction->load(['tests', 'events.user', 'cashier']);

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
            'created_at' => $transaction->created_at?->toDateTimeString(),
            'tests' => $transaction->tests->map(fn (TransactionTest $test) => [
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
                'address' => $transaction->patient_address,
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

            $base['events'] = $transaction->events->map(fn (TransactionEvent $event) => [
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

        return Patient::create([
            'first_name' => $patientData['first_name'],
            'last_name' => $patientData['last_name'],
            'age' => $patientData['age'] ?? null,
            'gender' => $patientData['gender'] ?? null,
            'contact_number' => $patientData['contact'] ?? null,
            'address' => $patientData['address'] ?? null,
            'birth_date' => $patientData['birth_date'] ?? null,
        ]);
    }

    protected function generateSequence(string $prefix): string
    {
        $today = now()->format('Ymd');
        $sequence = (int) cache()->increment("sequence:{$prefix}:{$today}");
        cache()->put("sequence:{$prefix}:{$today}", $sequence, now()->addDay());

        return sprintf('%s-%s-%04d', $prefix, $today, $sequence);
    }

    protected function paginatedTransactions(Request $request, int $limit = 25)
    {
        $search = $request->input('search');

        return Transaction::with(['tests', 'cashier'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('transaction_number', 'like', "%{$search}%")
                        ->orWhere('receipt_number', 'like', "%{$search}%")
                        ->orWhere('patient_first_name', 'like', "%{$search}%")
                        ->orWhere('patient_last_name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn (Transaction $transaction) => $this->transformTransaction($transaction))
            ->values();
    }

    protected function availableDiscounts(): array
    {
        return [
            [
                'id' => 'none',
                'name' => 'No Discount',
                'rate' => 0,
                'description' => 'Default pricing without discount',
            ],
            [
                'id' => 'senior',
                'name' => 'Senior Citizen (20%)',
                'rate' => 20,
                'description' => 'Base discount for senior citizens',
            ],
            [
                'id' => 'pwd',
                'name' => 'PWD (20%)',
                'rate' => 20,
                'description' => 'Base discount for PWD patients',
            ],
            [
                'id' => 'employee',
                'name' => 'Employee Discount (15%)',
                'rate' => 15,
                'description' => 'Discount for partner employees',
            ],
        ];
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
}
