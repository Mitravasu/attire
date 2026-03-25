import { useState } from "react";
import { deleteOutfit } from "api/outfits/deleteOutfit";
import { useToast } from "components/feedback/ToastProvider";
import { ConfirmationModal } from "components/ui/ConfirmationModal";
import { Outfit } from "types/outfit";

type DeleteOutfitModalProps = {
  outfit: Outfit;
  onClose: () => void;
  onSuccess: (outfit: Outfit) => void;
};

export function DeleteOutfitModal({
  outfit,
  onClose,
  onSuccess,
}: DeleteOutfitModalProps) {
  const { pushToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);

    try {
      const deletedOutfit = await deleteOutfit(outfit.id);
      pushToast("Outfit deleted.");
      onSuccess(deletedOutfit);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Failed to delete outfit.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="presentation">
      <ConfirmationModal
        cancelLabel="Cancel"
        confirmLabel={isSubmitting ? "Deleting..." : "Delete Outfit"}
        description={`Delete ${outfit.name}? Inventory items will remain untouched.`}
        onCancel={isSubmitting ? undefined : onClose}
        onConfirm={isSubmitting ? undefined : handleConfirm}
        title="Delete Outfit"
      >
        <div className="delete-outfit-preview">
          <div className="delete-outfit-preview__images">
            {outfit.items.slice(0, 4).map((item) => (
              <img key={item.id} alt={item.title} src={item.frontImageUrl} />
            ))}
          </div>
          <div className="delete-outfit-preview__details">
            <h3>{outfit.name}</h3>
            <p>{outfit.items.length} items will remain in inventory.</p>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}

