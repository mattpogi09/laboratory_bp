import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { X, Shield } from "lucide-react";
import { useForm } from "@inertiajs/react";

export default function CreatePhilHealthModal({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        coverage_rate: "",
        description: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("philhealth-plans.store"), {
            onSuccess: () => {
                reset();
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
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                            Create PhilHealth Plan
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation -mr-2"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="name" value="Plan Name" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g., PhilHealth Basic"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="coverage_rate"
                            value="Coverage Rate (%)"
                        />
                        <TextInput
                            id="coverage_rate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="mt-1 block w-full"
                            value={data.coverage_rate}
                            onChange={(e) =>
                                setData("coverage_rate", e.target.value)
                            }
                            placeholder="e.g., 50"
                            required
                        />
                        <InputError
                            message={errors.coverage_rate}
                            className="mt-2"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Enter coverage percentage (0-100)
                        </p>
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Description" />
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder="Enter plan description..."
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <InputError
                            message={errors.description}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                    <PrimaryButton
                        type="submit"
                        disabled={processing}
                        className="flex-1 min-h-[44px] sm:min-h-0 touch-manipulation"
                    >
                        {processing ? "Creating..." : "Create Plan"}
                    </PrimaryButton>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={processing}
                        className="flex-1 px-4 py-2.5 sm:py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[44px] sm:min-h-0 touch-manipulation"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}
