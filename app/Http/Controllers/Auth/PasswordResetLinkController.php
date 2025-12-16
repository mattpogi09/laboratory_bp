<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\SendPasswordResetOTP;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request - Send OTP to email.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Email is required.',
            'email.email' => 'Please provide a valid email address.',
        ]);

        // Check if user exists
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['We could not find a user with that email address.'],
            ]);
        }

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Delete any existing OTP for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Store OTP in database
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'otp' => $otp,
            'created_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMinutes(10),
            'is_verified' => false,
        ]);

        $message = 'We have sent a 6-digit OTP to your email address. Please check your inbox.';

        // Send OTP via email in background (don't wait for it)
        try {
            Mail::to($request->email)->queue(new SendPasswordResetOTP($otp, $user->name));
        } catch (\Exception $e) {
            // Log error but don't fail - OTP is already in database
            \Log::error('Failed to queue OTP email: ' . $e->getMessage());
        }

        // Return JSON for API requests
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'status' => 'success'
            ]);
        }

        return back()->with('status', $message);
    }

    /**
     * Verify the OTP code provided by the user.
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            throw ValidationException::withMessages([
                'otp' => ['No OTP request found. Please request a new OTP.'],
            ]);
        }

        // Check if OTP has expired
        if (Carbon::parse($resetRecord->expires_at)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages([
                'otp' => ['This OTP has expired. Please request a new one.'],
            ]);
        }

        // Verify OTP
        if ($resetRecord->otp !== $request->otp) {
            throw ValidationException::withMessages([
                'otp' => ['The OTP you entered is incorrect. Please try again.'],
            ]);
        }

        // Mark OTP as verified
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->update(['is_verified' => true]);

        $message = 'OTP verified successfully. You can now reset your password.';

        // Return JSON for API requests
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'status' => 'success',
                'email' => $request->email
            ]);
        }

        // Redirect to password reset page with email
        return redirect()->route('password.reset', ['token' => 'verified', 'email' => $request->email])
            ->with('status', $message);
    }
}
