import { FormEvent, useMemo, useState } from "react";
import { updateInventoryItem } from "api/inventory/updateInventoryItem";
import { useToast } from "components/feedback/ToastProvider";
import { Button } from "components/ui/Button";
import { DiscardChangesModal } from "components/ui/DiscardChangesModal";
import { Input } from "components/ui/Input";
import { Modal } from "components/ui/Modal";
import { Select } from "components/ui/Select";
import { useBeforeUnload } from "lib/useBeforeUnload";
import { InventoryItem, InventoryStatus, InventoryType } from "types/inventory";
import {
  InventoryFormErrors,
  InventoryFormState,
  inventoryItemToFormState,
  parseTags,
  updateImageFieldFromInput,
  validateInventoryForm,
} from "./inventoryForm";

type EditItemModalProps = {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: (updatedItem: InventoryItem) => void;
};

export function EditItemModal({
  item,
  onClose,
  onSuccess,
}: EditItemModalProps) {
  const { pushToast } = useToast();
  const initialFormState = useMemo(() => inventoryItemToFormState(item), [item]);
  const [formState, setFormState] = useState<InventoryFormState>(initialFormState);
  const [errors, setErrors] = useState<InventoryFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const tagPreview = useMemo(() => parseTags(formState.tags), [formState.tags]);
  const isDirty =
    formState.title !== initialFormState.title ||
    formState.tags !== initialFormState.tags ||
    formState.color !== initialFormState.color ||
    formState.type !== initialFormState.type ||
    formState.status !== initialFormState.status ||
    formState.frontImageUrl !== initialFormState.frontImageUrl ||
    formState.backImageUrl !== initialFormState.backImageUrl;

  useBeforeUnload(isDirty);

  function handleRequestClose() {
    if (isSubmitting) {
      return;
    }

    if (isDirty) {
      setIsDiscardModalOpen(true);
      return;
    }

    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateInventoryForm(formState);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const updatedItem = await updateInventoryItem(item.id, {
        title: formState.title.trim(),
        tags: parseTags(formState.tags),
        color: formState.color.trim().toLowerCase(),
        type: formState.type,
        status: formState.status,
        frontImageUrl: formState.frontImageUrl,
        backImageUrl: formState.backImageUrl || undefined,
      });

      pushToast("Inventory item updated.", "success");
      onSuccess(updatedItem);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to update inventory item.",
      });
      pushToast("Update failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDiscardModalOpen) {
    return (
      <DiscardChangesModal
        onDiscard={onClose}
        onKeepEditing={() => setIsDiscardModalOpen(false)}
      />
    );
  }

  return (
      <Modal
        onRequestClose={handleRequestClose}
        title="Edit Item"
        description="Update the item details below. Current images are shown for reference, and you can replace either image."
        footer={
          <>
            <Button onClick={handleRequestClose} variant="ghost">
              Cancel
            </Button>
            <Button form="edit-item-form" type="submit">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <form className="modal-form" id="edit-item-form" onSubmit={handleSubmit}>
          <div className="modal-image-preview">
            <div className="modal-image-preview__tile">
              <span className="field__label">Current Front</span>
              <img alt={`${item.title} front`} src={formState.frontImageUrl} />
            </div>
            <div className="modal-image-preview__tile">
              <span className="field__label">Current Back</span>
              {formState.backImageUrl ? (
                <img alt={`${item.title} back`} src={formState.backImageUrl} />
              ) : (
                <div className="modal-image-preview__empty">No back image</div>
              )}
            </div>
          </div>

          <Input
            id="edit-item-title"
            label="Title"
            onChange={(event) =>
              setFormState((current) => ({ ...current, title: event.target.value }))
            }
            value={formState.title}
          />
          {errors.title ? <p className="field__error">{errors.title}</p> : null}

          <Input
            id="edit-item-tags"
            label="Tags"
            onChange={(event) =>
              setFormState((current) => ({ ...current, tags: event.target.value }))
            }
            value={formState.tags}
          />
          {errors.tags ? <p className="field__error">{errors.tags}</p> : null}
          {tagPreview.length > 0 ? (
            <div className="filter-rail__chips">
              {tagPreview.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}

          <Input
            id="edit-item-color"
            label="Color"
            onChange={(event) =>
              setFormState((current) => ({ ...current, color: event.target.value }))
            }
            value={formState.color}
          />
          {errors.color ? <p className="field__error">{errors.color}</p> : null}

          <div className="modal-form__row">
            <Select
              id="edit-item-type"
              label="Type"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  type: event.target.value as InventoryType,
                }))
              }
              options={[
                { label: "Top", value: "top" },
                { label: "Bottom", value: "bottom" },
                { label: "Outerwear", value: "outerwear" },
                { label: "Shoes", value: "shoes" },
                { label: "Accessory", value: "accessory" },
              ]}
              value={formState.type}
            />
            <Select
              id="edit-item-status"
              label="Status"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value as InventoryStatus,
                }))
              }
              options={[
                { label: "Clean", value: "clean" },
                { label: "Laundry", value: "laundry" },
                { label: "Archived", value: "archived" },
              ]}
              value={formState.status}
            />
          </div>

          <label className="field" htmlFor="edit-item-front-image">
            <span className="field__label">Replace Front Image</span>
            <input
              accept="image/*"
              className="field__control"
              id="edit-item-front-image"
              onChange={(event) =>
                void updateImageFieldFromInput(
                  event,
                  "frontImageUrl",
                  setErrors,
                  setFormState,
                )
              }
              type="file"
            />
          </label>
          {errors.frontImageUrl ? <p className="field__error">{errors.frontImageUrl}</p> : null}

          <label className="field" htmlFor="edit-item-back-image">
            <span className="field__label">Replace Back Image</span>
            <input
              accept="image/*"
              className="field__control"
              id="edit-item-back-image"
              onChange={(event) =>
                void updateImageFieldFromInput(
                  event,
                  "backImageUrl",
                  setErrors,
                  setFormState,
                )
              }
              type="file"
            />
          </label>
          {errors.backImageUrl ? <p className="field__error">{errors.backImageUrl}</p> : null}

          {errors.submit ? <p className="field__error">{errors.submit}</p> : null}
        </form>
      </Modal>
  );
}
