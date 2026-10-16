import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Ghi nhận lỗi vào Sentry nếu đã cấu hình DSN
    if (import.meta.env.VITE_SENTRY_DSN) {
      import("@sentry/react").then((Sentry) => {
        Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
      });
    }
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Đã xảy ra lỗi không mong muốn.</h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Tải lại trang</button>
        </div>
      );
    }

    return this.props.children;
  }
}
