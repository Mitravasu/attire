import { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

type ConfirmationModalProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: ReactNode;
  confirmVariant?: "primary" | "secondary" | "ghost";
};

export function ConfirmationModal({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  children,
  confirmVariant = "primary",
}: ConfirmationModalProps) {
  return (
    <Modal
      onRequestClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} variant={confirmVariant}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
