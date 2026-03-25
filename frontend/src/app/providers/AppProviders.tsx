import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "components/feedback/ToastProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <ToastProvider>{children}</ToastProvider>
    </BrowserRouter>
  );
}

