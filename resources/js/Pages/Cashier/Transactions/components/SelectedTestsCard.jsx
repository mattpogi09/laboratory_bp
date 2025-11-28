import { memo } from 'react';
import { Trash2 } from 'lucide-react';

function SelectedTestsCard({ tests = [], onRemove }) {
    return (
        <section className="rounded-xl bg-white p-6 shadow">
            <header className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Selected Tests</h2>
                <p className="text-sm text-gray-500">{tests.length} item(s) added</p>
            </header>

            {tests.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                    No tests selected yet. Choose from the catalog to build the order.
                </p>
            ) : (
                <div className="space-y-3">
                    {tests.map((test) => (
                        <div
                            key={test.id}
                            className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                        >
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{test.name}</p>
                                <p className="text-xs text-gray-500">{test.category}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-900">
                                    ₱{Number(test.price).toLocaleString()}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRemove(test.id)}
                                    className="text-gray-400 transition hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default memo(SelectedTestsCard);

