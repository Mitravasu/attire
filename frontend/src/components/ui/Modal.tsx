import { ReactNode, useEffect, useId, useRef } from "react";

type ModalProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onRequestClose?: () => void;
};

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function Modal({
  title,
  description,
  children,
  footer,
  onRequestClose,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!dialog) {
      return;
    }

    const currentDialog = dialog;

    const focusableElements = Array.from(
      currentDialog.querySelectorAll<HTMLElement>(focusableSelector),
    );
    const firstFocusableElement = focusableElements[0] ?? currentDialog;
    firstFocusableElement.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && onRequestClose) {
        event.preventDefault();
        onRequestClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentFocusableElements = Array.from(
        currentDialog.querySelectorAll<HTMLElement>(focusableSelector),
      );

      if (!currentFocusableElements.length) {
        event.preventDefault();
        currentDialog.focus();
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement =
        currentFocusableElements[currentFocusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [onRequestClose]);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onRequestClose?.();
        }
      }}
      role="presentation"
    >
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="modal__header">
          <h2 id={titleId}>{title}</h2>
          {description ? (
            <p className="modal__description" id={descriptionId}>
              {description}
            </p>
          ) : null}
        </header>
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
