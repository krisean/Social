import { useToastContext } from "../shared/providers/ToastContext";
import { clsx } from "clsx";

const variantStyles: Record<string, string> = {
  info: "bg-slate-900 text-white",
  success: "bg-emerald-600 text-white",
  error: "bg-rose-600 text-white",
};

export function Toaster() {
  const { toasts, dismissToast } = useToastContext();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4 sm:left-auto sm:right-4 sm:translate-x-0">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className={clsx(
            "w-full rounded-xl px-4 py-3 text-left shadow-lg outline-none transition hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-brand-primary",
            variantStyles[toast.variant ?? "info"],
          )}
        >
          <p className="font-semibold">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-sm opacity-90">{toast.description}</p>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export default Toaster;
