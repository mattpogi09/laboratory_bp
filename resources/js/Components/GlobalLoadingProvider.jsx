import { createContext, useContext, useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import LoadingOverlay from "@/Components/LoadingOverlay";

const GlobalLoadingContext = createContext();

export function useGlobalLoading() {
    return useContext(GlobalLoadingContext);
}

export default function GlobalLoadingProvider({ children }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);

        router.on('start', start);
        router.on('finish', finish);
        router.on('error', finish);

        return () => {
            router.off('start', start);
            router.off('finish', finish);
            router.off('error', finish);
        };
    }, []);

    return (
        <GlobalLoadingContext.Provider value={{ loading, setLoading }}>
            <LoadingOverlay show={loading} message="Loading..." />
            {children}
        </GlobalLoadingContext.Provider>
    );
}