import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gradient-custom flex flex-col items-center justify-center">
            <div className="text-center">
                <img 
                    src="/images/logo.png" 
                    alt="BP Diagnostic" 
                    className="mx-auto h-16 mb-8 animate-pulse"
                />
                <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
            </div>
        </div>
    );
}