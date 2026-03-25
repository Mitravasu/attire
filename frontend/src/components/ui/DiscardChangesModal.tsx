import { ConfirmationModal } from "./ConfirmationModal";

type DiscardChangesModalProps = {
  onDiscard: () => void;
  onKeepEditing: () => void;
};

export function DiscardChangesModal({
  onDiscard,
  onKeepEditing,
}: DiscardChangesModalProps) {
  return (
    <ConfirmationModal
      cancelLabel="Keep Editing"
      confirmLabel="Discard Changes"
      confirmVariant="secondary"
      description="You have unsaved changes. Discard them and close this form?"
      onCancel={onKeepEditing}
      onConfirm={onDiscard}
      title="Discard changes?"
    />
  );
}
