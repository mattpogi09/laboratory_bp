import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import InputError from "@/Components/InputError";
import { X, Eye, EyeOff } from "lucide-react";

export default function EditUserModal({ user, show, onClose }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user?.name || "",
        username: user?.username || "",
        email: user?.email || "",
        role: user?.role || "",
        password: "",
    });

    useEffect(() => {
        if (user) {
            setData({
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                password: "",
            });
        }
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("users.update", user.id), {
            onSuccess: () => {
                reset("password");
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Edit User
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel>Name</InputLabel>
                        <TextInput
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Full name"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel>Username</InputLabel>
                        <TextInput
                            value={data.username}
                            onChange={(e) =>
                                setData("username", e.target.value)
                            }
                            placeholder="Username"
                            required
                        />
                        <InputError
                            message={errors.username}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel>Email</InputLabel>
                        <TextInput
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="Email address"
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel>Role</InputLabel>
                        <select
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                            className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2.5 text-xs sm:text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            required
                        >
                            <option value="">Select a role</option>
                            <option value="admin">Admin</option>
                            <option value="lab_staff">Lab Staff</option>
                            <option value="cashier">Cashier</option>
                        </select>
                        <InputError message={errors.role} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel>
                            New Password (Leave blank to keep current)
                        </InputLabel>
                        <div className="relative">
                            <TextInput
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="Enter new password..."
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 touch-manipulation"
                            >
                                {showPassword ? (
                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                ) : (
                                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                            </button>
                        </div>
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <PrimaryButton
                            type="submit"
                            className="flex-1 min-h-[44px] sm:min-h-0 touch-manipulation"
                            disabled={processing}
                        >
                            {processing ? "Updating..." : "Update User"}
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 min-h-[44px] sm:min-h-0 bg-white hover:bg-gray-100 text-black rounded-lg border border-gray-300 transition-colors touch-manipulation"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
