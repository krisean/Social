import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from "clsx";
export function Card({ className, interactive, selected, children, }) {
    return (_jsx("div", { className: clsx("rounded-3xl border border-slate-100 bg-white p-5 shadow-md shadow-slate-300/40 transition", interactive &&
            "cursor-pointer hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary", selected && "border-brand-primary shadow-lg", className), children: children }));
}
export default Card;
//# sourceMappingURL=Card.js.map