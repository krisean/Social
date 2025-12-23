import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import QRCode from "react-qr-code";
export function QRCodeBlock({ value, caption }) {
    return (_jsxs("div", { className: "flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow", children: [_jsx("div", { className: "overflow-hidden rounded-1xl bg-white p-1 shadow-inner", children: _jsx(QRCode, { value: value, size: 160, fgColor: "#0f172a", bgColor: "#ffffff" }) }), caption ? (_jsx("p", { className: "text-center text-sm font-medium text-slate-600", children: caption })) : null] }));
}
export default QRCodeBlock;
//# sourceMappingURL=QRCodeBlock.js.map