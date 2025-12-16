import { memo, useState, useCallback, useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Button } from "@/Components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";

const Login = memo(function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const isFormValid = useMemo(
        () => data.username.trim() !== "" && data.password.trim() !== "",
        [data.username, data.password]
    );

    const submit = useCallback(
        (e) => {
            e.preventDefault();
            post(route("login"), {
                onFinish: () => reset("password"),
            });
        },
        [post, reset]
    );

    const togglePassword = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6">
            <Head title="Log in" />

            <div className="glass-panel w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <img
                        src="/images/logo.png"
                        alt="BP Diagnostic Laboratory"
                        className="mx-auto h-16 mb-4"
                        loading="eager"
                        decoding="async"
                        width="64"
                        height="64"
                    />
                    <h2 className="text-black text-xl font-semibold">
                        BP Diagnostic
                    </h2>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-white bg-green-500/20 p-3 rounded-lg">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <InputLabel
                            htmlFor="username"
                            value="Username"
                            className="text-gray-700 font-medium"
                        />
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="w-full bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#eea7a7] focus:ring-[#ac3434]"
                            placeholder="Enter your Username"
                            autoComplete="username"
                            isFocused={false}
                            onChange={(e) =>
                                setData("username", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.username}
                            className="text-red-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-gray-700 font-medium"
                        />
                        <div className="relative">
                            <TextInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={data.password}
                                className="w-full bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#eea7a7] focus:ring-[#ac3434] pr-10"
                                placeholder="Enter your Password"
                                autoComplete="current-password"
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <Eye className="h-5 w-5" />
                                ) : (
                                    <EyeOff className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <InputError
                            message={errors.password}
                            className="text-red-600"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="border-gray-300 bg-white data-[state=checked]:bg-[#ac3434] data-[state=checked]:text-white"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Remember me
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-sm text-[#ac3434] hover:text-[#990000]"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <Button
                        className="w-full bg-[#ac3434] text-white hover:bg-[#ba4242]"
                        disabled={processing || !isFormValid}
                        type="submit"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            "LOGIN"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
});

export default Login;
