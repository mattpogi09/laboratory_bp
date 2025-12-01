import { useForm, router } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { X } from "lucide-react";
import { useEffect } from "react";

export default function EditServiceModal({
    service,
    show,
    onClose,
    categories = [],
}) {
    const { data, setData, put, processing, errors, reset } = useForm({
        category: "",
        name: "",
        price: "",
        description: "",
    });

    useEffect(() => {
        if (service) {
            setData({
                category: service.category || "",
                name: service.name || "",
                price: service.price || "",
                description: service.description || "",
            });
        }
    }, [service]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("services.update", service.id), {
            onSuccess: () => {
                reset();
                onClose();
                router.reload({ only: ["tests"] });
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Edit Service
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors touch-manipulation p-1"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-3 sm:space-y-4"
                >
                    <div>
                        <InputLabel className="text-xs sm:text-sm">
                            Category <span className="text-red-500">*</span>
                        </InputLabel>
                        <select
                            value={data.category}
                            onChange={(e) =>
                                setData("category", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-400 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                                {errors.category}
                            </p>
                        )}
                    </div>

                    <div>
                        <InputLabel className="text-xs sm:text-sm">
                            Test Name <span className="text-red-500">*</span>
                        </InputLabel>
                        <TextInput
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Complete Blood Count"
                            className="min-h-[44px] sm:min-h-0 text-xs sm:text-sm touch-manipulation"
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <InputLabel className="text-xs sm:text-sm">
                            Price (₱) <span className="text-red-500">*</span>
                        </InputLabel>
                        <TextInput
                            type="number"
                            value={data.price}
                            onChange={(e) => setData("price", e.target.value)}
                            placeholder="250"
                            step="0.01"
                            min="0"
                            className="min-h-[44px] sm:min-h-0 text-xs sm:text-sm touch-manipulation"
                            required
                        />
                        {errors.price && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                                {errors.price}
                            </p>
                        )}
                    </div>

                    <div>
                        <InputLabel className="text-xs sm:text-sm">
                            Description <span className="text-red-500">*</span>
                        </InputLabel>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder="Enter service description..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-400 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-black placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none touch-manipulation"
                            required
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs sm:text-sm text-red-600">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="flex-1 min-h-[44px] sm:min-h-0 text-xs sm:text-sm touch-manipulation"
                        >
                            {processing ? "Updating..." : "Update"}
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border-gray-500 shadow-xl bg-white/5 hover:bg-gray-300 text-black rounded-lg border border-white/10 transition-colors min-h-[44px] sm:min-h-0 text-xs sm:text-sm touch-manipulation"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
