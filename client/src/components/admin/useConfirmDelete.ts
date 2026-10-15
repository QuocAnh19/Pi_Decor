import { useState, useCallback } from "react";

/**
 * Hook quản lý trạng thái modal xác nhận xoá đối tượng.
 * Đóng gói logic mở/đóng modal, lưu đối tượng đang chờ xoá và xử lý async loading.
 */
export function useConfirmDelete<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const requestDelete = useCallback((item: T) => {
    setTarget(item);
  }, []);

  const cancelDelete = useCallback(() => {
    setTarget(null);
  }, []);

  const executeDelete = useCallback(
    async (handler: (item: T) => Promise<void>) => {
      if (!target) return;
      setLoading(true);
      try {
        await handler(target);
        setTarget(null);
      } finally {
        setLoading(false);
      }
    },
    [target]
  );

  return {
    target,
    isOpen: target !== null,
    loading,
    requestDelete,
    cancelDelete,
    executeDelete,
  };
}
