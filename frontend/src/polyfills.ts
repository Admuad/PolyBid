// Polyfills setup - MUST be imported before anything else
import { Buffer } from 'buffer';

// Store native fetch before any modifications
const nativeFetch = window.fetch.bind(window);

// Set up polyfills
if (typeof window !== 'undefined') {
    // Buffer polyfill
    (window as any).Buffer = Buffer;

    // Process polyfill
    (window as any).process = (window as any).process || { env: {} };

    // Global polyfill
    (window as any).global = window;

    // Ensure fetch is always the native implementation using getter/setter
    Object.defineProperty(window, 'fetch', {
        get: () => nativeFetch,
        set: () => { }, // Ignore any attempts to override
        configurable: true,
    });

    Object.defineProperty(globalThis, 'fetch', {
        get: () => nativeFetch,
        set: () => { }, // Ignore any attempts to override
        configurable: true,
    });
}

export { };
