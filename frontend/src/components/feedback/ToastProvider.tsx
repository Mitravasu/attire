import {
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

type Toast = {
  id: number;
  message: string;
  tone: "info" | "success" | "error";
};

type ToastContextValue = {
  pushToast: (message: string, tone?: Toast["tone"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (message: string, tone: Toast["tone"] = "info") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="toast-stack"
        data-testid="toast-stack"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.tone}`}
            data-testid="toast"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
