<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
  public function index(Request $request)
  {
    // Check if user is admin
    if (auth()->user()->role !== 'admin') {
      abort(403, 'Unauthorized action.');
    }

    $search = $request->input('search', '');
    $sortBy = $request->input('sort_by', 'created_at');
    $sortOrder = $request->input('sort_order', 'desc');
    $perPage = $request->input('per_page', 20);

    $query = User::query();

    // Apply search filter
    if ($search) {
      $query->where(function ($q) use ($search) {
        $q->where('name', 'ILIKE', "%{$search}%")
          ->orWhere('username', 'ILIKE', "%{$search}%")
          ->orWhere('email', 'ILIKE', "%{$search}%")
          ->orWhere('role', 'ILIKE', "%{$search}%");
      });
    }

    // Apply sorting
    $query->orderBy($sortBy, $sortOrder);

    $users = $query->paginate($perPage);

    return Inertia::render('Management/Users/Index', [
      'users' => $users,
      'filters' => [
        'search' => $search,
        'sort_by' => $sortBy,
        'sort_order' => $sortOrder,
      ],
    ]);
  }

  public function store(Request $request, AuditLogger $auditLogger)
  {
    // Check if user is admin
    if (auth()->user()->role !== 'admin') {
      abort(403, 'Unauthorized action.');
    }

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'username' => 'required|string|max:255|unique:users',
      'email' => 'required|string|email|max:255|unique:users',
      'role' => 'required|in:admin,lab_staff,cashier',
      'password' => 'required|string|min:8',
    ], [
      'name.required' => 'Name is required.',
      'username.required' => 'Username is required.',
      'username.unique' => 'This username is already taken.',
      'email.required' => 'Email address is required.',
      'email.email' => 'Please enter a valid email address.',
      'email.unique' => 'This email address is already registered.',
      'role.required' => 'User role is required.',
      'role.in' => 'Please select a valid user role.',
      'password.required' => 'Password is required.',
      'password.min' => 'Password must be at least 8 characters.',
    ]);

    $user = User::create([
      'name' => $validated['name'],
      'username' => $validated['username'],
      'email' => $validated['email'],
      'role' => $validated['role'],
      'is_active' => true,
      'password' => Hash::make($validated['password']),
    ]);

    $auditLogger->logUserCreated([
      'id' => $user->id,
      'name' => $user->name,
      'username' => $user->username,
      'email' => $user->email,
      'role' => $user->role,
    ]);

    return redirect()->back()->with('success', 'User created successfully');
  }

  public function update(Request $request, $id, AuditLogger $auditLogger)
  {
    // Check if user is admin
    if (auth()->user()->role !== 'admin') {
      abort(403, 'Unauthorized action.');
    }

    $user = User::findOrFail($id);

    $oldData = [
      'name' => $user->name,
      'username' => $user->username,
      'email' => $user->email,
      'role' => $user->role,
    ];

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
      'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
      'role' => 'required|in:admin,lab_staff,cashier',
      'password' => 'nullable|string|min:8',
    ], [
      'name.required' => 'Name is required.',
      'username.required' => 'Username is required.',
      'username.unique' => 'This username is already taken.',
      'email.required' => 'Email address is required.',
      'email.email' => 'Please enter a valid email address.',
      'email.unique' => 'This email address is already registered.',
      'role.required' => 'User role is required.',
      'role.in' => 'Please select a valid user role.',
      'password.min' => 'Password must be at least 8 characters.',
    ]);

    $updateData = [
      'name' => $validated['name'],
      'username' => $validated['username'],
      'email' => $validated['email'],
      'role' => $validated['role'],
    ];

    if (!empty($validated['password'])) {
      $updateData['password'] = Hash::make($validated['password']);
    }

    $user->update($updateData);

    $auditLogger->logUserUpdated($id, $oldData, $validated);

    return redirect()->back()->with('success', 'User updated successfully');
  }

  public function toggleActive($id, AuditLogger $auditLogger)
  {
    // Check if user is admin
    if (auth()->user()->role !== 'admin') {
      abort(403, 'Unauthorized action.');
    }

    $user = User::findOrFail($id);

    // Prevent admin from deactivating themselves
    if ($user->id === auth()->id()) {
      return redirect()->back()->with('error', 'You cannot deactivate your own account');
    }

    $user->update([
      'is_active' => !$user->is_active
    ]);

    $auditLogger->logUserToggled($user->id, $user->name, $user->is_active);

    $status = $user->is_active ? 'activated' : 'deactivated';
    return redirect()->back()->with('success', "User {$status} successfully");
  }
}
