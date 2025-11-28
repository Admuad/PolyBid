import { toast } from 'react-hot-toast';

/**
 * Error Handler Utility
 * Parses various error types and returns user-friendly messages
 */

/**
 * Parse transaction errors and extract meaningful messages
 */
export function parseTransactionError(error: any): string {
    const errorString = error?.message || error?.toString() || 'Unknown error';

    // User rejected transaction
    if (errorString.includes('user rejected') || errorString.includes('User denied')) {
        return 'Transaction cancelled by user.';
    }

    // Insufficient funds
    if (errorString.includes('insufficient funds') || errorString.includes('insufficient balance')) {
        return 'Insufficient funds. Please add more ETH to your wallet.';
    }

    // Gas estimation failed
    if (errorString.includes('gas required exceeds') || errorString.includes('out of gas')) {
        return 'Transaction would fail. Please check your bid amount and try again.';
    }

    // Arithmetic overflow/underflow
    if (errorString.includes('0x11') || errorString.includes('arithmetic')) {
        return 'Transaction failed: Arithmetic overflow. Please check your bid amount.';
    }

    // Contract revert with reason
    if (errorString.includes('execution reverted:')) {
        const reasonMatch = errorString.match(/execution reverted: (.+?)(?:\n|$)/);
        if (reasonMatch && reasonMatch[1]) {
            return `Transaction reverted: ${reasonMatch[1]}`;
        }
        return 'Transaction reverted. Please try again.';
    }

    // Generic revert
    if (errorString.includes('revert') || errorString.includes('reverted')) {
        return 'Transaction reverted. Please check your inputs and try again.';
    }

    // Network errors
    if (errorString.includes('network') || errorString.includes('connection')) {
        return 'Network connection lost. Please check your internet and try again.';
    }

    // Nonce too low
    if (errorString.includes('nonce too low')) {
        return 'Transaction nonce error. Please reset your MetaMask account or wait a moment.';
    }

    // Default fallback
    return 'Transaction failed. Please try again.';
}

/**
 * Parse FHE/Relayer errors with helpful troubleshooting steps
 */
export function parseRelayerError(error: any): string {
    const errorString = error?.message || error?.toString() || 'Unknown error';

    // Relayer connection errors
    if (
        errorString.includes('relayer') ||
        errorString.includes('userDecrypt') ||
        errorString.includes('Cannot read property') ||
        errorString.includes('undefined')
    ) {
        return `Unable to connect to encryption service. Please try:
1) Switch to Sepolia network
2) Disable VPN/Proxy
3) Refresh the page
4) Try again in a few minutes`;
    }

    // FHE initialization errors
    if (errorString.includes('fhevmjs') || errorString.includes('initFhevm')) {
        return 'Encryption service initialization failed. Please refresh the page.';
    }

    // ACL/Permission errors
    if (errorString.includes('not authorized') || errorString.includes('permission')) {
        return 'Permission denied. You may not have access to decrypt this data.';
    }

    return 'Encryption error. Please refresh the page and try again.';
}

/**
 * Parse network switching errors
 */
export function parseNetworkError(error: any): string {
    const errorString = error?.message || error?.toString() || 'Unknown error';

    if (errorString.includes('user rejected') || errorString.includes('User denied')) {
        return 'Network switch cancelled. Please switch to Sepolia manually.';
    }

    if (errorString.includes('wallet_switchEthereumChain')) {
        return 'Unable to switch network. Please switch to Sepolia manually in your wallet.';
    }

    return 'Network error. Please switch to Sepolia network manually.';
}

/**
 * Show user-friendly error toast notification
 */
export function showErrorToast(error: any, context?: string) {
    let message: string;

    // Determine error type and parse accordingly
    if (context === 'relayer' || context === 'fhe') {
        message = parseRelayerError(error);
    } else if (context === 'network') {
        message = parseNetworkError(error);
    } else {
        message = parseTransactionError(error);
    }

    // Show toast with appropriate styling
    toast.error(message, {
        duration: 6000,
        style: {
            maxWidth: '500px',
            whiteSpace: 'pre-line', // Allow line breaks in message
        },
    });

    // Also log to console for debugging
    console.error(`[${context || 'error'}]`, error);
}

/**
 * Show user-friendly success toast
 */
export function showSuccessToast(message: string) {
    toast.success(message, {
        duration: 4000,
    });
}

/**
 * Show info toast
 */
export function showInfoToast(message: string) {
    toast(message, {
        duration: 4000,
        icon: 'ℹ️',
    });
}
