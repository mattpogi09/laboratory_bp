<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\TransactionTest;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) min($request->input('per_page', 15), 50);
        $search = $request->input('search');

        $patientsQuery = Patient::query()
            ->withCount('transactions')
            ->withSum('transactions as total_spent', 'net_total')
            ->with([
                'transactions' => fn ($query) => $query
                    ->select('id', 'patient_id', 'net_total', 'created_at')
                    ->latest()
                    ->limit(1),
            ])
            ->orderBy('updated_at', 'desc');

        if ($search) {
            $patientsQuery->where(function ($query) use ($search) {
                $query
                    ->where('first_name', 'ILIKE', "%{$search}%")
                    ->orWhere('last_name', 'ILIKE', "%{$search}%")
                    ->orWhere('middle_name', 'ILIKE', "%{$search}%")
                    ->orWhere('contact_number', 'ILIKE', "%{$search}%");
            });
        }

        $patients = $patientsQuery->paginate($perPage);

        return response()->json([
            'data' => $patients->map(function (Patient $patient) {
                $latestTransaction = $patient->transactions->first();

                return [
                    'id' => $patient->id,
                    'full_name' => $patient->full_name,
                    'age' => $patient->age,
                    'gender' => $patient->gender,
                    'contact_number' => $patient->contact_number,
                    'last_visit' => $latestTransaction?->created_at?->toDateTimeString(),
                    'last_visit_amount' => $latestTransaction?->net_total,
                    'total_transactions' => $patient->transactions_count,
                    'total_spent' => (float) ($patient->total_spent ?? 0),
                ];
            }),
            'meta' => [
                'current_page' => $patients->currentPage(),
                'last_page' => $patients->lastPage(),
                'per_page' => $patients->perPage(),
                'total' => $patients->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'age' => ['nullable', 'integer', 'min:0'],
            'street' => ['nullable', 'string', 'max:255'],
            'region_id' => ['nullable', 'string', 'max:10'],
            'province_id' => ['nullable', 'string', 'max:10'],
            'city_id' => ['nullable', 'string', 'max:10'],
            'barangay_code' => ['nullable', 'string', 'max:10'],
        ]);

        if (!isset($data['age']) && isset($data['birth_date'])) {
            $data['age'] = now()->diffInYears($data['birth_date']);
        }

        $patient = Patient::create($data);

        return response()->json([
            'message' => 'Patient created successfully.',
            'patient' => [
                'id' => $patient->id,
                'full_name' => $patient->full_name,
                'gender' => $patient->gender,
                'contact_number' => $patient->contact_number,
                'email' => $patient->email,
            ],
        ], 201);
    }

    public function show(Patient $patient)
    {
        $patient->load([
            'transactions' => fn ($query) => $query
                ->with(['tests' => fn ($testQuery) => $testQuery->select('id', 'transaction_id', 'test_name', 'status', 'price')])
                ->latest()
                ->take(5),
        ]);

        $pendingTests = TransactionTest::whereHas('transaction', fn ($query) => $query->where('patient_id', $patient->id))
            ->whereIn('status', ['pending', 'processing'])
            ->count();

        $completedTests = TransactionTest::whereHas('transaction', fn ($query) => $query->where('patient_id', $patient->id))
            ->whereIn('status', ['completed', 'released'])
            ->count();

        return response()->json([
            'patient' => [
                'id' => $patient->id,
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name,
                'middle_name' => $patient->middle_name,
                'full_name' => $patient->full_name,
                'age' => $patient->age,
                'gender' => $patient->gender,
                'contact_number' => $patient->contact_number,
                'email' => $patient->email,
                'birth_date' => $patient->birth_date?->format('Y-m-d'),
                'address' => $patient->formatted_address,
                'region_id' => $patient->region_id,
                'province_id' => $patient->province_id,
                'city_id' => $patient->city_id,
                'barangay_code' => $patient->barangay_code,
                'street' => $patient->street,
            ],
            'stats' => [
                'total_transactions' => $patient->transactions->count(),
                'pending_tests' => $pendingTests,
                'completed_tests' => $completedTests,
            ],
            'recent_transactions' => $patient->transactions->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'net_total' => $transaction->net_total,
                    'payment_status' => $transaction->payment_status,
                    'lab_status' => $transaction->lab_status,
                    'created_at' => $transaction->created_at->toDateTimeString(),
                    'tests' => $transaction->tests->map(fn ($test) => [
                        'id' => $test->id,
                        'name' => $test->test_name,
                        'status' => $test->status,
                        'price' => $test->price,
                    ]),
                ];
            }),
        ]);
    }

    public function update(Request $request, Patient $patient)
    {
        $rules = [
            'email' => 'nullable|email|max:255',
            'contact_number' => ['nullable', 'regex:/^09[0-9]{9}$/'],
            'region_id' => 'nullable|exists:regions,region_id',
            'province_id' => 'nullable|exists:provinces,province_id',
            'city_id' => 'nullable|exists:cities,city_id',
            'barangay_code' => 'nullable|exists:barangays,code',
            'street' => 'nullable|string|max:255',
        ];

        $messages = [
            'email.email' => 'Please enter a valid email address.',
            'contact_number.regex' => 'Phone number must be in format 09XXXXXXXXX (11 digits starting with 09).',
        ];

        // Admin can update all fields
        if (auth()->user()->role === 'admin') {
            $rules = array_merge($rules, [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'age' => 'required|integer|min:0|max:150',
                'gender' => 'required|in:Male,Female',
                'birth_date' => 'nullable|date',
            ]);

            $messages = array_merge($messages, [
                'first_name.required' => 'First name is required.',
                'last_name.required' => 'Last name is required.',
                'age.required' => 'Age is required.',
                'age.integer' => 'Age must be a number.',
                'age.min' => 'Age must be at least 0.',
                'age.max' => 'Age cannot exceed 150.',
                'gender.required' => 'Gender is required.',
                'gender.in' => 'Please select a valid gender.',
                'birth_date.date' => 'Please enter a valid birth date.',
            ]);
        }

        $validated = $request->validate($rules, $messages);

        $patient->update($validated);

        return response()->json([
            'message' => 'Patient updated successfully.',
            'patient' => [
                'id' => $patient->id,
                'full_name' => $patient->full_name,
                'age' => $patient->age,
                'gender' => $patient->gender,
                'contact_number' => $patient->contact_number,
                'email' => $patient->email,
                'address' => $patient->formatted_address,
            ],
        ]);
    }
}

