import { useSyncExternalStore } from "react";

type ToastListener = () => void;
let currentToast: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<ToastListener>();

/**
 * Quản lý thông báo toast toàn cục không phụ thuộc React state.
 * Dùng cho mutation onError handler và các luồng phản hồi nhanh.
 */
export const toast = {
  show(message: string, duration = 3500) {
    currentToast = message;
    listeners.forEach((l) => l());
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      currentToast = null;
      listeners.forEach((l) => l());
    }, duration);
  },
  error(err: unknown, fallback = "Có lỗi xảy ra, vui lòng thử lại.") {
    const msg = err instanceof Error ? err.message : fallback;
    toast.show(msg);
  },
  subscribe(listener: ToastListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    return currentToast;
  },
};

export function useGlobalToast() {
  return useSyncExternalStore(toast.subscribe, toast.getSnapshot, () => null);
}
