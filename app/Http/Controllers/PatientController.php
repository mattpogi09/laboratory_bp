<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\TransactionTest;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $perPage = $request->input('per_page', 20);

        $patientsQuery = Patient::with(['transactions.tests', 'region', 'province', 'city', 'barangay'])
            // Only show active patients for non-admin users
            ->when(auth()->user()->role !== 'admin', function ($query) {
                $query->where('is_active', true);
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$search}%"])
                        ->orWhereRaw("'P' || EXTRACT(YEAR FROM created_at) || '-' || LPAD(CAST(id AS TEXT), 3, '0') ILIKE ?", ["%{$search}%"])
                        ->orWhere('email', 'ILIKE', "%{$search}%")
                        ->orWhere('contact_number', 'ILIKE', "%{$search}%");
                });
            })
            ->orderBy($sortBy, $sortOrder);

        $patients = $patientsQuery->paginate($perPage)->through(function ($patient) {
            // Get all tests from all transactions
            $tests = $patient->transactions->flatMap(function ($transaction) {
                return $transaction->tests->map(function ($test) use ($transaction) {
                    return [
                        'id' => $test->id, // Add test ID for fetching details
                        'name' => $test->test_name,
                        'date' => $transaction->created_at->format('Y-m-d'),
                        'status' => $test->status,
                        'result' => $test->result_values['result_value'] ?? null,
                    ];
                });
            })->sortByDesc('date')->values()->all();

            return [
                'id' => $patient->id,
                'patient_id' => 'P' . date('Y') . '-' . str_pad($patient->id, 3, '0', STR_PAD_LEFT),
                'name' => $patient->full_name,
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name,
                'middle_name' => $patient->middle_name,
                'email' => $patient->email,
                'is_active' => $patient->is_active,
                'age' => $patient->age,
                'gender' => $patient->gender,
                'contact_number' => $patient->contact_number,
                'address' => $patient->formatted_address,
                'region_id' => $patient->region_id,
                'province_id' => $patient->province_id,
                'city_id' => $patient->city_id,
                'barangay_code' => $patient->barangay_code,
                'street' => $patient->street,
                'date_of_birth' => $patient->date_of_birth,
                'last_visit' => optional($patient->transactions()->latest()->first())->created_at?->format('Y-m-d') ?? 'N/A',
                'total_tests' => $patient->transactions()->withCount('tests')->get()->sum('tests_count'),
                'tests' => $tests,
            ];
        });

        return Inertia::render('Management/Patients/PatientManagement', [
            'patients' => $patients,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'age' => 'required|integer|min:0|max:150',
            'gender' => 'required|in:Male,Female',
            'contact_number' => ['required', 'regex:/^09[0-9]{9}$/'],
            'region_id' => 'required|exists:regions,region_id',
            'province_id' => 'required|exists:provinces,province_id',
            'city_id' => 'required|exists:cities,city_id',
            'barangay_code' => 'required|exists:barangays,code',
            'street' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date|before:today',
        ], [
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'email.email' => 'Please enter a valid email address.',
            'age.required' => 'Age is required.',
            'age.integer' => 'Age must be a number.',
            'age.min' => 'Age must be at least 0.',
            'age.max' => 'Age cannot exceed 150.',
            'gender.required' => 'Gender is required.',
            'gender.in' => 'Please select a valid gender.',
            'contact_number.required' => 'Contact number is required.',
            'contact_number.regex' => 'Phone number must be in format 09XXXXXXXXX (11 digits starting with 09).',
            'region_id.required' => 'Region is required.',
            'province_id.required' => 'Province is required.',
            'city_id.required' => 'City/Municipality is required.',
            'barangay_code.required' => 'Barangay is required.',
            'street.required' => 'Street address is required.',
            'date_of_birth.date' => 'Please enter a valid birth date.',
            'date_of_birth.before' => 'Birth date must be in the past.',
        ]);

        $patient = Patient::create($validated);

        app(AuditLogger::class)->logPatientCreated([
            'id' => $patient->id,
            'first_name' => $patient->first_name,
            'last_name' => $patient->last_name,
            'middle_name' => $patient->middle_name,
            'age' => $patient->age,
            'gender' => $patient->gender,
            'contact_number' => $patient->contact_number,
            'address' => $patient->formatted_address,
            'email' => $patient->email,
        ]);

        return redirect()->back()->with('success', 'Patient created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        // Convert MM/DD/YYYY to YYYY-MM-DD for validation
        if (isset($request->date_of_birth) && $request->date_of_birth) {
            $dob = $request->date_of_birth;
            // Check if format is MM/DD/YYYY
            if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dob, $matches)) {
                $request->merge([
                    'date_of_birth' => $matches[3] . '-' . $matches[1] . '-' . $matches[2]
                ]);
            }
        }

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
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'age.required' => 'Age is required.',
            'age.integer' => 'Age must be a number.',
            'age.min' => 'Age must be at least 0.',
            'age.max' => 'Age cannot exceed 150.',
            'gender.required' => 'Gender is required.',
            'gender.in' => 'Please select a valid gender.',
            'date_of_birth.date' => 'Please enter a valid birth date in MM/DD/YYYY format.',
            'date_of_birth.before' => 'Birth date must be in the past.',
        ];

        // Admin can update all fields
        if (auth()->user()->role === 'admin') {
            $rules = array_merge($rules, [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'age' => 'required|integer|min:0|max:150',
                'gender' => 'required|in:Male,Female',
                'date_of_birth' => 'nullable|date|before:today',
            ]);
        }

        $validated = $request->validate($rules, $messages);

        $oldData = $patient->only(['first_name', 'last_name', 'middle_name', 'age', 'gender', 'contact_number', 'region_id', 'province_id', 'city_id', 'barangay_code', 'street', 'email']);

        $patient->update($validated);

        app(AuditLogger::class)->logPatientUpdated($patient->id, $oldData, $validated);

        return redirect()->back()->with('success', 'Patient updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        // Only admin can delete
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $patientName = $patient->full_name;
        $patientId = $patient->id;

        $patient->delete();

        app(AuditLogger::class)->logPatientDeleted($patientId, $patientName);

        return redirect()->back()->with('success', 'Patient deleted successfully.');
    }

    /**
     * Search patients for transaction forms
     */
    public function search(Request $request)
    {
        $query = $request->input('query', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $patients = Patient::with(['region', 'province', 'city', 'barangay'])
            ->active() // Only show active patients for cashier/lab staff
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'ILIKE', "%{$query}%")
                    ->orWhere('last_name', 'ILIKE', "%{$query}%")
                    ->orWhere('contact_number', 'ILIKE', "%{$query}%")
                    ->orWhere('email', 'ILIKE', "%{$query}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$query}%"])
                    ->orWhereRaw("CONCAT(last_name, ' ', first_name) ILIKE ?", ["%{$query}%"]);
            })
            ->limit(10)
            ->get()
            ->map(function ($patient) {
                // Format date of birth to MM/DD/YYYY if it exists
                $dateOfBirth = null;
                if ($patient->date_of_birth) {
                    try {
                        $dateOfBirth = \Carbon\Carbon::parse($patient->date_of_birth)->format('m/d/Y');
                    } catch (\Exception $e) {
                        $dateOfBirth = $patient->date_of_birth;
                    }
                }

                return [
                    'id' => $patient->id,
                    'patient_id' => 'P' . date('Y') . '-' . str_pad($patient->id, 3, '0', STR_PAD_LEFT),
                    'first_name' => $patient->first_name,
                    'last_name' => $patient->last_name,
                    'middle_name' => $patient->middle_name,
                    'full_name' => $patient->full_name,
                    'email' => $patient->email,
                    'age' => $patient->age,
                    'gender' => $patient->gender,
                    'contact_number' => $patient->contact_number,
                    'address' => $patient->formatted_address,
                    'region_id' => $patient->region_id,
                    'province_id' => $patient->province_id,
                    'city_id' => $patient->city_id,
                    'barangay_code' => $patient->barangay_code,
                    'street' => $patient->street,
                    'date_of_birth' => $dateOfBirth,
                ];
            });

        return response()->json($patients);
    }

    /**
     * Get detailed test result information
     */
    public function getTestDetails(Request $request, $transactionTestId)
    {
        $transactionTest = TransactionTest::with([
            'performedBy:id,name,email',
            'labTest:id,name,code,category,description'
        ])->findOrFail($transactionTestId);

        // Convert image paths to full URLs
        $documents = [];
        if ($transactionTest->result_images) {
            foreach ($transactionTest->result_images as $image) {
                if (is_array($image) && isset($image['path'])) {
                    $documents[] = [
                        'name' => $image['name'] ?? '',
                        'path' => $image['path'],
                        'url' => \Storage::url($image['path']),
                        'size' => $image['size'] ?? 0,
                    ];
                }
            }
        }

        return response()->json([
            'id' => $transactionTest->id,
            'test_name' => $transactionTest->test_name,
            'category' => $transactionTest->category,
            'status' => $transactionTest->status,
            'price' => $transactionTest->price,
            'result_values' => $transactionTest->result_values,
            'result_notes' => $transactionTest->result_notes,
            'normal_range' => $transactionTest->normal_range, // Use actual normal_range from transaction test
            'started_at' => $transactionTest->started_at?->format('Y-m-d H:i:s'),
            'completed_at' => $transactionTest->completed_at?->format('Y-m-d H:i:s'),
            'released_at' => $transactionTest->released_at?->format('Y-m-d H:i:s'),
            'performed_by' => $transactionTest->performedBy ? [
                'id' => $transactionTest->performedBy->id,
                'name' => $transactionTest->performedBy->name,
                'email' => $transactionTest->performedBy->email,
            ] : null,
            'documents' => $documents,
        ]);
    }

    /**
     * Activate a patient
     */
    public function activate(Patient $patient)
    {
        if ($patient->is_active) {
            return redirect()->back()->with('info', 'Patient is already active.');
        }

        $patient->update(['is_active' => true]);

        app(AuditLogger::class)->log(
            'activate',
            'patient_management',
            "Activated patient: {$patient->full_name}",
            [
                'patient_id' => $patient->id,
                'patient_name' => $patient->full_name,
                'action' => 'activated',
            ],
            'info',
            'Patient',
            $patient->id
        );

        return redirect()->back()->with('success', 'Patient activated successfully.');
    }

    /**
     * Deactivate a patient
     */
    public function deactivate(Patient $patient)
    {
        if (!$patient->is_active) {
            return redirect()->back()->with('info', 'Patient is already deactivated.');
        }

        $patient->update(['is_active' => false]);

        app(AuditLogger::class)->log(
            'deactivate',
            'patient_management',
            "Deactivated patient: {$patient->full_name}",
            [
                'patient_id' => $patient->id,
                'patient_name' => $patient->full_name,
                'action' => 'deactivated',
            ],
            'warning',
            'Patient',
            $patient->id
        );

        return redirect()->back()->with('success', 'Patient deactivated successfully.');
    }
}

