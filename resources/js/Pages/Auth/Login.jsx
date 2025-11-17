import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    // Add loading state if needed
    const [isLoading, setIsLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        post(route('login'), {
            onFinish: () => {
                setIsLoading(false);
                reset('password');
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-custom flex items-center justify-center p-6">
            <Head title="Log in" />
            
            <div className="glass-panel w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <img 
                        src="/images/logo.png" 
                        alt="BP Diagnostic and Clinical Laboratory" 
                        className="mx-auto h-16 mb-4"
                    />
                    <h2 className="text-white text-xl font-semibold">BP Diagnostic</h2>
                    <p className="text-white/80">Admin Panel</p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-white bg-green-500/20 p-3 rounded-lg">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <InputLabel htmlFor="username" value="Username" className="text-white" />
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="admin"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('username', e.target.value)}
                        />
                        <InputError message={errors.username} className="text-red-300" />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="password" value="Password" className="text-white" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="text-red-300" />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="border-white/20 bg-white/10 data-[state=checked]:bg-white data-[state=checked]:text-black"
                            />
                            <span className="ml-2 text-sm text-white/80">Remember me</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-white/80 hover:text-white"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <Button 
                        className="w-full bg-white text-black hover:bg-white/90" 
                        disabled={processing}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            'Log in'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
