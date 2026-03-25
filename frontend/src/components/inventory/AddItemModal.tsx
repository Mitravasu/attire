import { FormEvent, useMemo, useState } from "react";
import { createInventoryItem } from "api/inventory/createInventoryItem";
import { useToast } from "components/feedback/ToastProvider";
import { Button } from "components/ui/Button";
import { DiscardChangesModal } from "components/ui/DiscardChangesModal";
import { Input } from "components/ui/Input";
import { Modal } from "components/ui/Modal";
import { Select } from "components/ui/Select";
import { useBeforeUnload } from "lib/useBeforeUnload";
import { InventoryStatus, InventoryType } from "types/inventory";
import {
  InventoryFormErrors,
  InventoryFormState,
  initialInventoryFormState,
  parseTags,
  updateImageFieldFromInput,
  validateInventoryForm,
} from "./inventoryForm";

type AddItemModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export function AddItemModal({ onClose, onSuccess }: AddItemModalProps) {
  const { pushToast } = useToast();
  const [formState, setFormState] = useState<InventoryFormState>(
    initialInventoryFormState,
  );
  const [errors, setErrors] = useState<InventoryFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const tagPreview = useMemo(() => parseTags(formState.tags), [formState.tags]);
  const isDirty =
    formState.title.trim().length > 0 ||
    formState.tags.trim().length > 0 ||
    formState.color.trim().length > 0 ||
    formState.type !== initialInventoryFormState.type ||
    formState.status !== initialInventoryFormState.status ||
    formState.frontImageUrl.length > 0 ||
    formState.backImageUrl.length > 0;

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
      await createInventoryItem({
        title: formState.title.trim(),
        tags: parseTags(formState.tags),
        color: formState.color.trim().toLowerCase(),
        type: formState.type,
        status: formState.status,
        frontImageUrl: formState.frontImageUrl,
        backImageUrl: formState.backImageUrl || undefined,
      });
      pushToast("Inventory item created.");
      onSuccess();
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to create inventory item.",
      });
      pushToast("Create failed.");
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
        title="Add Item"
        description="Add a new clothing item with required front imagery, optional back imagery, and wardrobe metadata."
        footer={
          <>
            <Button onClick={handleRequestClose} variant="ghost">
              Cancel
            </Button>
            <Button form="add-item-form" type="submit">
              {isSubmitting ? "Saving..." : "Save Item"}
            </Button>
          </>
        }
      >
        <form className="modal-form" id="add-item-form" onSubmit={handleSubmit}>
          <Input
            id="add-item-title"
            label="Title"
            onChange={(event) =>
              setFormState((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Oxford shirt"
            value={formState.title}
          />
          {errors.title ? <p className="field__error">{errors.title}</p> : null}

          <Input
            id="add-item-tags"
            label="Tags"
            onChange={(event) =>
              setFormState((current) => ({ ...current, tags: event.target.value }))
            }
            placeholder="work, white, cotton"
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
            id="add-item-color"
            label="Color"
            onChange={(event) =>
              setFormState((current) => ({ ...current, color: event.target.value }))
            }
            placeholder="Navy"
            value={formState.color}
          />
          {errors.color ? <p className="field__error">{errors.color}</p> : null}

          <div className="modal-form__row">
            <Select
              id="add-item-type"
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
              id="add-item-status"
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

          <label className="field" htmlFor="add-item-front-image">
            <span className="field__label">Front Image</span>
            <input
              accept="image/*"
              className="field__control"
              id="add-item-front-image"
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

          <label className="field" htmlFor="add-item-back-image">
            <span className="field__label">Back Image</span>
            <input
              accept="image/*"
              className="field__control"
              id="add-item-back-image"
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
