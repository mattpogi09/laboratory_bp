<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabTest;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ServiceController extends Controller
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
        $category = $request->input('category', '');
        $perPage = (int) min($request->input('per_page', 20), 50);

        $query = LabTest::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('category', 'ILIKE', "%{$search}%");
            });
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        $query->orderBy('category')->orderBy('name');

        $tests = $query->paginate($perPage);

        return response()->json([
            'data' => $tests->map(function (LabTest $test) {
                return [
                    'id' => $test->id,
                    'name' => $test->name,
                    'category' => $test->category,
                    'price' => (float) $test->price,
                    'description' => $test->description,
                    'is_active' => $test->is_active,
                    'created_at' => $test->created_at->toDateTimeString(),
                ];
            }),
            'current_page' => $tests->currentPage(),
            'last_page' => $tests->lastPage(),
            'per_page' => $tests->perPage(),
            'total' => $tests->total(),
        ]);
    }

    public function categories()
    {
        $categories = Cache::remember('lab_test_categories', 3600, function () {
            return LabTest::select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category');
        });

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ], [
            'name.required' => 'Test name is required.',
            'category.required' => 'Category is required.',
            'price.required' => 'Price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'price.min' => 'Price cannot be negative.',
        ]);

        $code = strtoupper(str_replace(' ', '-', $validated['category'] . '-' . $validated['name']));

        $test = LabTest::create([
            'code' => $code,
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? '',
            'is_active' => true,
        ]);

        $this->auditLogger->logServiceCreated([
            'id' => $test->id,
            'code' => $code,
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? '',
        ]);

        Cache::forget('lab_test_categories');
        Cache::forget('lab_test_category_stats');

        return response()->json([
            'message' => 'Service created successfully',
            'service' => [
                'id' => $test->id,
                'name' => $test->name,
                'category' => $test->category,
                'price' => (float) $test->price,
                'description' => $test->description,
                'is_active' => $test->is_active,
            ],
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $test = LabTest::findOrFail($id);

        $oldData = [
            'name' => $test->name,
            'category' => $test->category,
            'price' => $test->price,
            'description' => $test->description,
        ];

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ], [
            'name.required' => 'Test name is required.',
            'category.required' => 'Category is required.',
            'price.required' => 'Price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'price.min' => 'Price cannot be negative.',
        ]);

        $test->update([
            'code' => strtoupper(str_replace(' ', '-', $validated['category'] . '-' . $validated['name'])),
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'description' => $validated['description'] ?? '',
        ]);

        $this->auditLogger->logServiceUpdated($id, $oldData, $validated);

        Cache::forget('lab_test_categories');
        Cache::forget('lab_test_category_stats');

        return response()->json([
            'message' => 'Service updated successfully',
            'service' => [
                'id' => $test->id,
                'name' => $test->name,
                'category' => $test->category,
                'price' => (float) $test->price,
                'description' => $test->description,
                'is_active' => $test->is_active,
            ],
        ]);
    }

    public function toggleActive(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $test = LabTest::findOrFail($id);
        $test->is_active = !$test->is_active;
        $test->save();

        $this->auditLogger->logServiceToggled($test->id, $test->name, $test->is_active);

        Cache::forget('lab_test_category_stats');

        return response()->json([
            'message' => $test->is_active ? 'Service activated' : 'Service deactivated',
            'service' => [
                'id' => $test->id,
                'is_active' => $test->is_active,
            ],
        ]);
    }
}

