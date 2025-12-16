import { memo } from 'react';
import { Printer } from 'lucide-react';

function QueuePreview({ patientName, testsCount, netTotal, queueNumber }) {
    return (
        <section className="rounded-xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Queue Preview</p>
                    <p className="text-2xl font-semibold text-gray-900">Queue #{queueNumber}</p>
                </div>
                <Printer className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                    <span>Patient</span>
                    <span className="font-medium">{patientName || '—'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tests</span>
                    <span className="font-medium">{testsCount}</span>
                </div>
                <div className="flex justify-between">
                    <span>Amount Due</span>
                    <span className="font-semibold text-gray-900">₱{netTotal.toLocaleString()}</span>
                </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
                Print the official receipt from the transaction list once saved. This preview helps you
                verify queue details before submission.
            </p>
        </section>
    );
}

export default memo(QueuePreview);

