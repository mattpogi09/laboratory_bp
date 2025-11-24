<?php

namespace App\Http\Controllers;

use App\Models\PhilHealthPlan;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class PhilHealthPlanController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        $search = $request->input('search', '');

        $plans = PhilHealthPlan::when($search, function ($query, $search) {
            $query->where('name', 'ILIKE', "%{$search}%")
                ->orWhere('description', 'ILIKE', "%{$search}%");
        })
            ->orderBy('name')
            ->paginate(10);

        return response()->json($plans);
    }

    public function store(Request $request, AuditLogger $auditLogger)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'coverage_rate' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ], [
            'name.required' => 'Plan name is required.',
            'coverage_rate.required' => 'Coverage rate is required.',
            'coverage_rate.numeric' => 'Coverage rate must be a number.',
            'coverage_rate.min' => 'Coverage rate cannot be negative.',
            'coverage_rate.max' => 'Coverage rate cannot exceed 100%.',
        ]);

        $plan = PhilHealthPlan::create($validated);

        $auditLogger->logPhilHealthPlanCreated([
            'id' => $plan->id,
            'name' => $plan->name,
            'coverage_rate' => $plan->coverage_rate,
            'description' => $plan->description,
        ]);

        return back()->with('success', 'PhilHealth plan created successfully');
    }

    public function update(Request $request, $id, AuditLogger $auditLogger)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'coverage_rate' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ], [
            'name.required' => 'Plan name is required.',
            'coverage_rate.required' => 'Coverage rate is required.',
            'coverage_rate.numeric' => 'Coverage rate must be a number.',
            'coverage_rate.min' => 'Coverage rate cannot be negative.',
            'coverage_rate.max' => 'Coverage rate cannot exceed 100%.',
        ]);

        $plan = PhilHealthPlan::findOrFail($id);
        $oldData = $plan->toArray();

        $plan->update($validated);

        $auditLogger->logPhilHealthPlanUpdated($plan->id, $oldData, $plan->toArray());

        return back()->with('success', 'PhilHealth plan updated successfully');
    }

    public function toggleActive($id, AuditLogger $auditLogger)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $plan = PhilHealthPlan::findOrFail($id);

        $plan->update([
            'is_active' => !$plan->is_active
        ]);

        $auditLogger->logPhilHealthPlanToggled($plan->id, $plan->name, $plan->is_active);

        $status = $plan->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "PhilHealth plan {$status} successfully");
    }
}
