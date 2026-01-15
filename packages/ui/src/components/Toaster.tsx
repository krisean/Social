import { useToast, type Toast } from "../shared/providers/ToastContext";
import { clsx } from "clsx";

const variantStyles: Record<'success' | 'error' | 'info', string> = {
  info: "bg-blue-600 text-white",
  success: "bg-emerald-600 text-white",
  error: "bg-rose-600 text-white",
};

export function Toaster() {
  const { toasts } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4 sm:left-auto sm:right-4 sm:translate-x-0">
      {toasts.filter(toast => toast.title).map((toast: Toast) => (
        <div
          key={toast.id}
          className={clsx(
            "w-full rounded-xl px-4 py-3 text-left shadow-lg outline-none transition",
            toast.variant ? variantStyles[toast.variant] : variantStyles.info,
          )}
        >
          <p className="font-semibold">{toast.title}</p>
          {toast.description && (
            <p className="text-sm opacity-90 mt-1">{toast.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default Toaster;
