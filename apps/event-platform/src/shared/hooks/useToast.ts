import { useCallback } from "react";
import { useToastContext } from "../providers/ToastContext";

export function useToast() {
  const { showToast, dismissToast } = useToastContext();

  const toast = useCallback(
    (options: Parameters<typeof showToast>[0]) => showToast(options),
    [showToast],
  );

  return { toast, dismissToast };
}
export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "success" | "error" | "info";
}

export type Toast = (options: ToastOptions) => void;
