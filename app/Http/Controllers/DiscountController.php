<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use App\Models\PhilHealthPlan;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DiscountController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $perPage = $request->input('per_page', 20);

        $discounts = Discount::when($search, function ($query, $search) {
            $query->where('name', 'ILIKE', "%{$search}%")
                ->orWhere('description', 'ILIKE', "%{$search}%");
        })
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage);

        return Inertia::render('Configuration/DiscountsPhilhealth/Index', [
            'discounts' => $discounts,
            'philHealthPlans' => PhilHealthPlan::orderBy('name')->paginate(20),
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function store(Request $request, AuditLogger $auditLogger)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ], [
            'name.required' => 'Discount name is required.',
            'rate.required' => 'Discount rate is required.',
            'rate.numeric' => 'Discount rate must be a number.',
            'rate.min' => 'Discount rate cannot be negative.',
            'rate.max' => 'Discount rate cannot exceed 100%.',
        ]);

        $discount = Discount::create($validated);

        // Clear discounts cache
        Cache::forget('active_discounts');

        $auditLogger->logDiscountCreated([
            'id' => $discount->id,
            'name' => $discount->name,
            'rate' => $discount->rate,
            'description' => $discount->description,
        ]);

        return back()->with('success', 'Discount created successfully');
    }

    public function update(Request $request, $id, AuditLogger $auditLogger)
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ], [
            'name.required' => 'Discount name is required.',
            'rate.required' => 'Discount rate is required.',
            'rate.numeric' => 'Discount rate must be a number.',
            'rate.min' => 'Discount rate cannot be negative.',
            'rate.max' => 'Discount rate cannot exceed 100%.',
        ]);

        $discount = Discount::findOrFail($id);
        $oldData = $discount->toArray();

        $discount->update($validated);

        // Clear discounts cache
        Cache::forget('active_discounts');

        $auditLogger->logDiscountUpdated($discount->id, $oldData, $discount->toArray());

        return back()->with('success', 'Discount updated successfully');
    }

    public function toggleActive($id, AuditLogger $auditLogger)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $discount = Discount::findOrFail($id);

        $discount->update([
            'is_active' => !$discount->is_active
        ]);

        // Clear discounts cache
        Cache::forget('active_discounts');

        $auditLogger->logDiscountToggled($discount->id, $discount->name, $discount->is_active);

        $status = $discount->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Discount {$status} successfully");
    }
}
