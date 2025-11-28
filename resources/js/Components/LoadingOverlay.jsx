import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ show, message = "Loading..." }) {
    if (!show) return null;
    
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center" style={{ zIndex: 9999 }}>
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <Loader2 className="h-10 w-10 animate-spin text-black mx-auto mb-3" />
                <p className="text-sm font-medium text-center text-gray-800 whitespace-nowrap">{message}</p>
            </div>
        </div>
    );
}
