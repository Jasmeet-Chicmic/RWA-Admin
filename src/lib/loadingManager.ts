/**
 * Standalone loading manager — tracks in-flight Axios requests
 * without touching Redux (avoids circular-dependency issues).
 */

type Listener = (loading: boolean) => void;

let activeRequests = 0;
const listeners = new Set<Listener>();

function notify() {
  const loading = activeRequests > 0;
  listeners.forEach((fn) => fn(loading));
}

export const loadingManager = {
  start() {
    activeRequests += 1;
    notify();
  },

  end() {
    activeRequests = Math.max(0, activeRequests - 1);
    notify();
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  isLoading(): boolean {
    return activeRequests > 0;
  },
};
