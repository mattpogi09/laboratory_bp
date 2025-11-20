import { ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestCatalog({ labTests = {}, selectedTests = [], onToggle, errors = {} }) {
    return (
        <section className="rounded-xl bg-white p-6 shadow space-y-4">
            <header className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-red-600" />
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Select Laboratory Tests</h2>
                    <p className="text-sm text-gray-500">Choose from the available catalog</p>
                </div>
            </header>

            <div className="space-y-5">
                {Object.entries(labTests).map(([category, tests]) => (
                    <div key={category}>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                {category}
                            </h3>
                            <span className="text-xs text-gray-500">{tests.length} options</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {tests.map((test) => {
                                const isSelected = selectedTests.includes(test.id);
                                return (
                                    <button
                                        key={test.id}
                                        type="button"
                                        onClick={() => onToggle(test.id)}
                                        className={cn(
                                            'flex items-center justify-between rounded-lg border px-4 py-3 text-left transition',
                                            isSelected
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 hover:border-red-400 hover:bg-gray-50'
                                        )}
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{test.name}</p>
                                            <p className="text-xs text-gray-500">{category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-semibold text-gray-900">
                                                ₱{Number(test.price).toLocaleString()}
                                            </p>
                                            {isSelected && (
                                                <span className="text-xs text-red-600">Selected</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {errors?.tests && (
                <p className="text-sm text-red-600">Please select at least one test.</p>
            )}
        </section>
    );
}

