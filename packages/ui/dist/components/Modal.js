import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
export function Modal({ open, onClose, title, footer, children, }) {
    useEffect(() => {
        if (!open)
            return;
        const handleKey = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);
    if (!open)
        return null;
    return createPortal(_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6", children: _jsxs("div", { className: "w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsx("div", { className: "flex-1 flex justify-center", children: _jsx("h2", { className: "text-xl font-semibold text-slate-900", children: title }) }), _jsx(Button, { variant: "ghost", className: "-mr-2 h-10 w-10 rounded-full p-0 text-xl flex-shrink-0", onClick: onClose, "aria-label": "Close", children: "X" })] }), _jsx("div", { className: "mt-4 space-y-3 text-sm text-slate-600", children: children }), footer ? _jsx("div", { className: "mt-6 flex justify-end", children: footer }) : null] }) }), document.body);
}
export default Modal;
//# sourceMappingURL=Modal.js.map