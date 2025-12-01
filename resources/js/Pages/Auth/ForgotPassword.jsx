import InputError from "@/Components/InputError";
import { Head, useForm, Link } from "@inertiajs/react";
import { Mail, ArrowLeft, KeyRound, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ForgotPassword({ status }) {
    const [step, setStep] = useState(1); // 1 = Email entry, 2 = OTP verification
    const [emailSent, setEmailSent] = useState(false);

    const emailForm = useForm({
        email: "",
    });

    const otpForm = useForm({
        email: "",
        otp: "",
    });

    const submitEmail = (e) => {
        e.preventDefault();
        emailForm.post(route("password.email"), {
            onSuccess: () => {
                setEmailSent(true);
                setStep(2);
                otpForm.setData("email", emailForm.data.email);
            },
        });
    };

    const submitOtp = (e) => {
        e.preventDefault();
        otpForm.post(route("password.verify-otp"));
    };

    const handleOtpInput = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        otpForm.setData("otp", value);
    };

    const resendOtp = () => {
        emailForm.post(route("password.email"), {
            onSuccess: () => {
                otpForm.setData("otp", "");
            },
        });
    };

    return (
        <>
            <Head title="Forgot Password" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4">
                            <img
                                src="/images/logo.png"
                                alt="BP Diagnostic Logo"
                                className="w-24 h-24 object-contain mx-auto"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            BP Diagnostic
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Laboratory Management System
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex items-center space-x-4">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                        step >= 1
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-200 text-gray-500"
                                    }`}
                                >
                                    {step > 1 ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        "1"
                                    )}
                                </div>
                                <div
                                    className={`w-16 h-1 ${
                                        step >= 2 ? "bg-red-600" : "bg-gray-200"
                                    }`}
                                ></div>
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                        step >= 2
                                            ? "bg-red-600 text-white"
                                            : "bg-gray-200 text-gray-500"
                                    }`}
                                >
                                    2
                                </div>
                            </div>
                        </div>

                        {/* Step 1: Email Entry */}
                        {step === 1 && (
                            <>
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                                        <Mail className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Forgot Password?
                                    </h2>
                                    <p className="text-gray-600 mt-2 text-sm">
                                        Enter your email address and we'll send
                                        you a 6-digit OTP code to reset your
                                        password.
                                    </p>
                                </div>

                                {status && (
                                    <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                                        <p className="text-sm text-green-800 text-center">
                                            {status}
                                        </p>
                                    </div>
                                )}

                                <form
                                    onSubmit={submitEmail}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={emailForm.data.email}
                                            onChange={(e) =>
                                                emailForm.setData(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                            placeholder="Enter your email"
                                            autoFocus
                                            required
                                        />
                                        <InputError
                                            message={emailForm.errors.email}
                                            className="mt-2"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={emailForm.processing}
                                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {emailForm.processing
                                            ? "Sending OTP..."
                                            : "Send OTP Code"}
                                    </button>

                                    <div className="text-center">
                                        <Link
                                            href={route("login")}
                                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Login
                                        </Link>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 2 && (
                            <>
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                                        <KeyRound className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Verify OTP Code
                                    </h2>
                                    <p className="text-gray-600 mt-2 text-sm">
                                        We've sent a 6-digit code to{" "}
                                        <span className="font-semibold">
                                            {otpForm.data.email}
                                        </span>
                                    </p>
                                </div>

                                {status && (
                                    <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                                        <p className="text-sm text-green-800 text-center">
                                            {status}
                                        </p>
                                    </div>
                                )}

                                <form
                                    onSubmit={submitOtp}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label
                                            htmlFor="otp"
                                            className="block text-sm font-medium text-gray-700 mb-2 text-center"
                                        >
                                            Enter 6-Digit OTP
                                        </label>
                                        <input
                                            id="otp"
                                            type="text"
                                            name="otp"
                                            value={otpForm.data.otp}
                                            onChange={handleOtpInput}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-center text-2xl tracking-widest font-mono"
                                            placeholder="000000"
                                            maxLength={6}
                                            autoFocus
                                            required
                                        />
                                        <InputError
                                            message={otpForm.errors.otp}
                                            className="mt-2"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={
                                            otpForm.processing ||
                                            otpForm.data.otp.length !== 6
                                        }
                                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {otpForm.processing
                                            ? "Verifying..."
                                            : "Verify & Continue"}
                                    </button>

                                    <div className="text-center space-y-3">
                                        <p className="text-sm text-gray-600">
                                            Didn't receive the code?{" "}
                                            <button
                                                type="button"
                                                onClick={resendOtp}
                                                disabled={emailForm.processing}
                                                className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
                                            >
                                                Resend OTP
                                            </button>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep(1);
                                                otpForm.reset();
                                            }}
                                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Change Email Address
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-sm text-gray-600">
                        <p>
                            &copy; {new Date().getFullYear()} BP Diagnostic
                            Laboratory. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
