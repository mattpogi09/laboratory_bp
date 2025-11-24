<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabTestController extends Controller
{
  public function index(Request $request)
  {
    if ($request->user()->role !== 'admin') {
      abort(403);
    }

    $search = $request->input('search', '');
    $category = $request->input('category', '');

    $tests = LabTest::query()
      ->when($search, function ($query, $search) {
        $query->where(function ($q) use ($search) {
          $q->where('name', 'ILIKE', "%{$search}%")
            ->orWhere('category', 'ILIKE', "%{$search}%");
        });
      })
      ->when($category && $category !== 'all', function ($query) use ($category) {
        $query->where('category', $category);
      })
      ->orderBy('category')
      ->orderBy('name')
      ->paginate(10)
      ->withQueryString();

    // Get unique categories for dropdown
    $categories = LabTest::select('category')
      ->distinct()
      ->orderBy('category')
      ->pluck('category');

    // Get category stats (count per category)
    $categoryStats = LabTest::selectRaw('category, COUNT(*) as count')
      ->groupBy('category')
      ->pluck('count', 'category');

    return Inertia::render('Management/Services/Index', [
      'tests' => $tests,
      'categories' => $categories,
      'categoryStats' => $categoryStats,
      'filters' => [
        'search' => $search,
        'category' => $category,
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
      'category' => 'required|string|max:255',
      'price' => 'required|numeric|min:0',
      'description' => 'required|string',
    ], [
      'name.required' => 'Test name is required.',
      'category.required' => 'Category is required.',
      'price.required' => 'Price is required.',
      'price.numeric' => 'Price must be a valid number.',
      'price.min' => 'Price cannot be negative.',
      'description.required' => 'Description is required.',
    ]);

    $code = strtoupper(str_replace(' ', '-', $validated['category'] . '-' . $validated['name']));

    $test = LabTest::create([
      'code' => $code,
      'name' => $validated['name'],
      'category' => $validated['category'],
      'price' => $validated['price'],
      'description' => $validated['description'],
      'is_active' => true,
    ]);

    $auditLogger->logServiceCreated([
      'id' => $test->id,
      'code' => $code,
      'name' => $validated['name'],
      'category' => $validated['category'],
      'price' => $validated['price'],
      'description' => $validated['description'],
    ]);

    return back()->with('success', 'Service added successfully');
  }

  public function update(Request $request, $id, AuditLogger $auditLogger)
  {
    if ($request->user()->role !== 'admin') {
      abort(403);
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
      'description' => 'required|string',
    ], [
      'name.required' => 'Test name is required.',
      'category.required' => 'Category is required.',
      'price.required' => 'Price is required.',
      'price.numeric' => 'Price must be a valid number.',
      'price.min' => 'Price cannot be negative.',
      'description.required' => 'Description is required.',
    ]);

    $test->update([
      'code' => strtoupper(str_replace(' ', '-', $validated['category'] . '-' . $validated['name'])),
      'name' => $validated['name'],
      'category' => $validated['category'],
      'price' => $validated['price'],
      'description' => $validated['description'],
    ]);

    $auditLogger->logServiceUpdated($id, $oldData, $validated);

    return back()->with('success', 'Service updated successfully');
  }

  public function toggleActive(Request $request, $id, AuditLogger $auditLogger)
  {
    if ($request->user()->role !== 'admin') {
      abort(403);
    }

    $test = LabTest::findOrFail($id);
    $test->is_active = !$test->is_active;
    $test->save();

    $auditLogger->logServiceToggled($test->id, $test->name, $test->is_active);

    return back()->with('success', $test->is_active ? 'Service activated' : 'Service deactivated');
  }
}
