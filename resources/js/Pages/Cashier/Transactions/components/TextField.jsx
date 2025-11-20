import { cn } from '@/lib/utils';

export default function TextField({ label, error, required, className, ...props }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <input
                {...props}
                className={cn(
                    'block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20',
                    className
                )}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

