import { useToast, type Toast } from "../shared/providers/ToastContext";
import { clsx } from "clsx";

const variantStyles: Record<Toast['type'], string> = {
  info: "bg-slate-900 text-white",
  success: "bg-emerald-600 text-white",
  error: "bg-rose-600 text-white",
  warning: "bg-amber-600 text-white",
};

export function Toaster() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4 sm:left-auto sm:right-4 sm:translate-x-0">
      {toasts.map((toast: Toast) => (
        <button
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={clsx(
            "w-full rounded-xl px-4 py-3 text-left shadow-lg outline-none transition hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-brand-primary",
            variantStyles[toast.type],
          )}
        >
          <p className="font-semibold">{toast.message}</p>
        </button>
      ))}
    </div>
  );
}

export default Toaster;
