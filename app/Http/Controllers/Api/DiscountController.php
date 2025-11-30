<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DiscountController extends Controller
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

        $query = Discount::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%");
            });
        }

        $query->orderBy($sortBy, $sortOrder);

        $discounts = $query->paginate($perPage);

        return response()->json([
            'data' => $discounts->map(function (Discount $discount) {
                return [
                    'id' => $discount->id,
                    'name' => $discount->name,
                    'rate' => (float) $discount->rate,
                    'description' => $discount->description,
                    'is_active' => $discount->is_active,
                    'created_at' => $discount->created_at->toDateTimeString(),
                ];
            }),
            'current_page' => $discounts->currentPage(),
            'last_page' => $discounts->lastPage(),
            'per_page' => $discounts->perPage(),
            'total' => $discounts->total(),
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
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

        Cache::forget('active_discounts');

        $this->auditLogger->logDiscountCreated([
            'id' => $discount->id,
            'name' => $discount->name,
            'rate' => $discount->rate,
            'description' => $discount->description,
        ]);

        return response()->json([
            'message' => 'Discount created successfully',
            'discount' => [
                'id' => $discount->id,
                'name' => $discount->name,
                'rate' => (float) $discount->rate,
                'description' => $discount->description,
                'is_active' => $discount->is_active,
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

        Cache::forget('active_discounts');

        $this->auditLogger->logDiscountUpdated($discount->id, $oldData, $discount->toArray());

        return response()->json([
            'message' => 'Discount updated successfully',
            'discount' => [
                'id' => $discount->id,
                'name' => $discount->name,
                'rate' => (float) $discount->rate,
                'description' => $discount->description,
                'is_active' => $discount->is_active,
            ],
        ]);
    }

    public function toggleActive(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $discount = Discount::findOrFail($id);

        $discount->update([
            'is_active' => !$discount->is_active,
        ]);

        Cache::forget('active_discounts');

        $this->auditLogger->logDiscountToggled($discount->id, $discount->name, $discount->is_active);

        $status = $discount->is_active ? 'activated' : 'deactivated';

        return response()->json([
            'message' => "Discount {$status} successfully",
            'discount' => [
                'id' => $discount->id,
                'is_active' => $discount->is_active,
            ],
        ]);
    }
}

