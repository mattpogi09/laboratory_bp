import { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import loadingManager from './LoadingManager';

export default function AppWrapper({ App, props }) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = loadingManager.subscribe(setIsLoading);
        return unsubscribe;
    }, []);

    return (
        <>
            {isLoading && <LoadingScreen />}
            <App {...props} />
        </>
    );
}

