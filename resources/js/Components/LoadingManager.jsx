// Global loading state manager for Inertia navigation
const loadingManager = {
    listeners: new Set(),
    isLoading: false,
    setLoading(value) {
        this.isLoading = value;
        this.listeners.forEach(listener => listener(value));
    },
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
};

export default loadingManager;

