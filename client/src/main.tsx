import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./lib/authContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GlobalToast } from "./components/ui";
import "./styles/main.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <GlobalToast />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
