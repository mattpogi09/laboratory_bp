<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        if (!Auth::attempt([
            'username' => $credentials['username'],
            'password' => $credentials['password'],
            'is_active' => true,
        ], $credentials['remember'] ?? false)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect or the account is inactive.'],
            ]);
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        if (!$user->is_active) {
            Auth::logout();

            return response()->json([
                'message' => 'Your account is currently disabled.',
            ], 423);
        }

        // Mobile app is admin-only access
        if ($user->role !== 'admin') {
            Auth::logout();

            return response()->json([
                'message' => 'Mobile app access is restricted to administrators only.',
            ], 403);
        }

        $user->tokens()->where('name', 'mobile-admin')->delete();

        $token = $user->createToken('mobile-admin')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}

