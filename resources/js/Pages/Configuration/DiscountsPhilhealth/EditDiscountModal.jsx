import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { X, Edit, Tag } from "lucide-react";
import { useForm } from "@inertiajs/react";
import { useEffect } from "react";

export default function EditDiscountModal({ discount, show, onClose }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: "",
        rate: "",
        description: "",
    });

    useEffect(() => {
        if (discount) {
            setData({
                name: discount.name || "",
                rate: discount.rate || "",
                description: discount.description || "",
            });
        }
    }, [discount]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("discounts.update", discount.id), {
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

    if (!discount) return null;

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                            <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                            Edit Discount
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
                        <InputLabel htmlFor="name" value="Discount Name" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="e.g., Senior Citizen, PWD"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="rate" value="Discount Rate (%)" />
                        <TextInput
                            id="rate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="mt-1 block w-full"
                            value={data.rate}
                            onChange={(e) => setData("rate", e.target.value)}
                            placeholder="e.g., 20"
                            required
                        />
                        <InputError message={errors.rate} className="mt-2" />
                        <p className="mt-1 text-xs text-gray-500">
                            Enter percentage value (0-100)
                        </p>
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="description"
                            value="Description (Optional)"
                        />
                        <textarea
                            id="description"
                            rows="3"
                            className="mt-1 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder="Provide additional details about this discount..."
                        />
                        <InputError
                            message={errors.description}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 min-h-[44px] sm:min-h-0 touch-manipulation"
                    >
                        {processing ? "Updating..." : "Update Discount"}
                    </button>
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
