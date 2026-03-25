import { useState } from "react";
import { deleteInventoryItem } from "api/inventory/deleteInventoryItem";
import { useToast } from "components/feedback/ToastProvider";
import { ConfirmationModal } from "components/ui/ConfirmationModal";
import { InventoryItem } from "types/inventory";

type DeleteItemModalProps = {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: (deletedItem: InventoryItem) => void;
};

export function DeleteItemModal({
  item,
  onClose,
  onSuccess,
}: DeleteItemModalProps) {
  const { pushToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);

    try {
      const deletedItem = await deleteInventoryItem(item.id);
      pushToast("Inventory item deleted.");
      onSuccess(deletedItem);
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "Failed to delete inventory item.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="presentation">
      <ConfirmationModal
        cancelLabel="Cancel"
        confirmLabel={isSubmitting ? "Deleting..." : "Delete Item"}
        description={`Delete ${item.title}? This removes it from the inventory grid.`}
        onCancel={isSubmitting ? undefined : onClose}
        onConfirm={isSubmitting ? undefined : handleConfirm}
        title="Delete Item"
      >
        <div className="delete-item-preview">
          <div className="delete-item-preview__media">
            <img alt={item.title} src={item.frontImageUrl} />
          </div>
          <div className="delete-item-preview__details">
            <h3>{item.title}</h3>
            <p>
              {item.color} · {item.type} · {item.status}
            </p>
            <ul className="inventory-card__tags" aria-label={`${item.title} tags`}>
              {item.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}

