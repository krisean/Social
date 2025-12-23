import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const ToastContext = createContext(undefined);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, message, type, duration };
        setToasts((prev) => [...prev, newToast]);
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };
    return (_jsx(ToastContext.Provider, { value: { toasts, addToast, removeToast }, children: children }));
}
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
// Convenience function for toast
export const toast = {
    success: (message) => {
        // This is a simplified version - in a real app you'd need a global toast manager
        console.log('Toast Success:', message);
    },
    error: (message) => {
        console.error('Toast Error:', message);
    },
    info: (message) => {
        console.info('Toast Info:', message);
    },
    warning: (message) => {
        console.warn('Toast Warning:', message);
    },
};
//# sourceMappingURL=ToastContext.js.map