<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhilHealthPlan;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PhilHealthPlanController extends Controller
{
    public function __construct(
        private readonly AuditLogger $auditLogger
    ) {
    }

    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $perPage = (int) min($request->input('per_page', 20), 50);

        $query = PhilHealthPlan::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%");
            });
        }

        $query->orderBy($sortBy, $sortOrder);

        $plans = $query->paginate($perPage);

        return response()->json([
            'data' => $plans->map(function (PhilHealthPlan $plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'coverage_rate' => (float) $plan->coverage_rate,
                    'description' => $plan->description,
                    'is_active' => $plan->is_active,
                    'created_at' => $plan->created_at->toDateTimeString(),
                ];
            }),
            'current_page' => $plans->currentPage(),
            'last_page' => $plans->lastPage(),
            'per_page' => $plans->perPage(),
            'total' => $plans->total(),
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
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

        Cache::forget('active_philhealth_plans');

        $this->auditLogger->logPhilHealthPlanCreated([
            'id' => $plan->id,
            'name' => $plan->name,
            'coverage_rate' => $plan->coverage_rate,
            'description' => $plan->description,
        ]);

        return response()->json([
            'message' => 'PhilHealth plan created successfully',
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'coverage_rate' => (float) $plan->coverage_rate,
                'description' => $plan->description,
                'is_active' => $plan->is_active,
            ],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
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

        Cache::forget('active_philhealth_plans');

        $this->auditLogger->logPhilHealthPlanUpdated($plan->id, $oldData, $plan->toArray());

        return response()->json([
            'message' => 'PhilHealth plan updated successfully',
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'coverage_rate' => (float) $plan->coverage_rate,
                'description' => $plan->description,
                'is_active' => $plan->is_active,
            ],
        ]);
    }

    public function toggleActive(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $plan = PhilHealthPlan::findOrFail($id);

        $plan->update([
            'is_active' => !$plan->is_active,
        ]);

        Cache::forget('active_philhealth_plans');

        $this->auditLogger->logPhilHealthPlanToggled($plan->id, $plan->name, $plan->is_active);

        $status = $plan->is_active ? 'activated' : 'deactivated';

        return response()->json([
            'message' => "PhilHealth plan {$status} successfully",
            'plan' => [
                'id' => $plan->id,
                'is_active' => $plan->is_active,
            ],
        ]);
    }
}

