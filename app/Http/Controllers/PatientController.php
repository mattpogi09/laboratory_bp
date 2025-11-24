<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $patientsQuery = Patient::with(['transactions.tests'])->latest();

        $patients = $patientsQuery->paginate(10)->through(function ($patient) {
            // Get all tests from all transactions
            $tests = $patient->transactions->flatMap(function ($transaction) {
                return $transaction->tests->map(function ($test) use ($transaction) {
                    return [
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
                'age' => $patient->age,
                'gender' => $patient->gender,
                'contact' => $patient->contact_number,
                'address' => $patient->address,
                'birth_date' => $patient->birth_date,
                'last_visit' => optional($patient->transactions()->latest()->first())->created_at?->format('Y-m-d') ?? 'N/A',
                'total_tests' => $patient->transactions()->withCount('tests')->get()->sum('tests_count'),
                'tests' => $tests,
            ];
        });

        return Inertia::render('Management/Patients/Index', [
            'patients' => $patients,
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
            'email' => 'nullable|email|max:255',
            'age' => 'required|integer|min:0|max:150',
            'gender' => 'required|in:Male,Female',
            'contact_number' => 'required|string|max:20',
            'address' => 'nullable|string|max:500',
            'birth_date' => 'nullable|date',
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
            'birth_date.date' => 'Please enter a valid birth date.',
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
            'address' => $patient->address,
            'email' => $patient->email,
        ]);

        return redirect()->back()->with('success', 'Patient created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        $rules = [
            'email' => 'nullable|email|max:255',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ];

        $messages = [
            'email.email' => 'Please enter a valid email address.',
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'age.required' => 'Age is required.',
            'age.integer' => 'Age must be a number.',
            'age.min' => 'Age must be at least 0.',
            'age.max' => 'Age cannot exceed 150.',
            'gender.required' => 'Gender is required.',
            'gender.in' => 'Please select a valid gender.',
            'birth_date.date' => 'Please enter a valid birth date.',
        ];

        // Admin can update all fields
        if (auth()->user()->role === 'admin') {
            $rules = array_merge($rules, [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'age' => 'required|integer|min:0|max:150',
                'gender' => 'required|in:Male,Female',
                'birth_date' => 'nullable|date',
            ]);
        }

        $validated = $request->validate($rules, $messages);

        $oldData = $patient->only(['first_name', 'last_name', 'middle_name', 'age', 'gender', 'contact_number', 'address', 'email']);

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

        $patients = Patient::query()
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
                    'address' => $patient->address,
                ];
            });

        return response()->json($patients);
    }
}

