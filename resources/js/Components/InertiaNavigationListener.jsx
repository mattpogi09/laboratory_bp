// Set up Inertia navigation event listeners
export function setupInertiaNavigationListener(loadingManager) {
    if (typeof window === 'undefined') return;

    // Try to set up listeners immediately, with retry mechanism
    function setupListeners() {
        import('@inertiajs/react').then(({ router }) => {
            if (router && typeof router.on === 'function') {
                // Set up event listeners
                router.on('start', () => {
                    loadingManager.setLoading(true);
                });

                router.on('finish', () => {
                    loadingManager.setLoading(false);
                });

                router.on('error', () => {
                    loadingManager.setLoading(false);
                });
            } else {
                // Router not ready yet, retry after a short delay
                setTimeout(setupListeners, 50);
            }
        }).catch(() => {
            // Fallback: listen to DOM events if router is not available
            // Only set up fallback if router import fails completely
            if (!window.__inertiaNavigationListenerSetup) {
                window.__inertiaNavigationListenerSetup = true;
                
                // Listen for Inertia page visits via DOM events
                document.addEventListener('inertia:start', () => {
                    loadingManager.setLoading(true);
                });

                document.addEventListener('inertia:finish', () => {
                    loadingManager.setLoading(false);
                });

                document.addEventListener('inertia:error', () => {
                    loadingManager.setLoading(false);
                });

                // Fallback: intercept fetch requests
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                    const url = args[0];
                    if (typeof url === 'string' && (url.includes('/') || url.startsWith('http'))) {
                        loadingManager.setLoading(true);
                        return originalFetch.apply(this, args)
                            .finally(() => {
                                loadingManager.setLoading(false);
                            });
                    }
                    return originalFetch.apply(this, args);
                };
            }
        });
    }

    // Try to set up immediately, with a fallback delay
    setupListeners();
    
    // Fallback: if router isn't ready after 200ms, try one more time
    setTimeout(() => {
        setupListeners();
    }, 200);
}

