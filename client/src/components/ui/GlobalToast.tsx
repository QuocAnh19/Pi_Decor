import { useGlobalToast } from "../../lib/toast";
import { Toast } from "./Toast";

/**
 * Hiển thị Toast toàn cục lắng nghe từ toast store.
 */
export function GlobalToast() {
  const message = useGlobalToast();
  return <Toast message={message || ""} visible={Boolean(message)} />;
}
