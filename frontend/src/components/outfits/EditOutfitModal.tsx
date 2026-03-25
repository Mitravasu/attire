import { FormEvent, useEffect, useMemo, useState } from "react";
import { listInventory } from "api/inventory/listInventory";
import { updateOutfit } from "api/outfits/updateOutfit";
import { useToast } from "components/feedback/ToastProvider";
import { Button } from "components/ui/Button";
import { Input } from "components/ui/Input";
import { Modal } from "components/ui/Modal";
import { Outfit } from "types/outfit";
import { InventoryItem } from "types/inventory";

type EditOutfitModalProps = {
  outfit: Outfit;
  onClose: () => void;
  onSuccess: (outfit: Outfit) => void;
};

export function EditOutfitModal({
  outfit,
  onClose,
  onSuccess,
}: EditOutfitModalProps) {
  const { pushToast } = useToast();
  const [name, setName] = useState(outfit.name);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>(outfit.items);
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      setIsLoadingInventory(true);

      try {
        const pages = await Promise.all([
          listInventory({ page: 1, pageSize: 24 }),
          listInventory({ page: 2, pageSize: 24 }),
        ]);
        const mergedItems = pages.flatMap((page) => page.items);

        if (!cancelled) {
          setAvailableItems(mergedItems);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load inventory items.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingInventory(false);
        }
      }
    }

    void loadInventory();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableToAdd = useMemo(
    () =>
      availableItems.filter(
        (item) => !selectedItems.some((selectedItem) => selectedItem.id === item.id),
      ),
    [availableItems, selectedItems],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Outfit name is required.");
      return;
    }

    if (!selectedItems.length) {
      setError("Add at least one item to the outfit.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const updatedOutfit = await updateOutfit(outfit.id, {
        name: name.trim(),
        itemIds: selectedItems.map((item) => item.id),
      });
      pushToast("Outfit updated.");
      onSuccess(updatedOutfit);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to update outfit.",
      );
      pushToast("Outfit update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-overlay" role="presentation">
      <Modal
        title="Edit Outfit"
        description="Update the outfit name and adjust the selected inventory items."
        footer={
          <>
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button form="edit-outfit-form" type="submit">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <form
          className="modal-form"
          data-testid="edit-outfit-form"
          id="edit-outfit-form"
          onSubmit={handleSubmit}
        >
          <Input
            id="edit-outfit-name"
            label="Outfit Name"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
          <div className="outfit-builder">
            <section className="outfit-builder__column">
              <h3>Selected Items</h3>
              <ul className="outfit-builder__list" data-testid="outfit-selected-items">
                {selectedItems.map((item) => (
                  <li
                    key={item.id}
                    className="outfit-builder__item"
                    data-testid={`outfit-selected-item-${item.id}`}
                  >
                    <img alt={item.title} src={item.frontImageUrl} />
                    <div>
                      <strong>{item.title}</strong>
                      <p>
                        {item.color} · {item.type}
                      </p>
                    </div>
                    <Button
                      data-testid={`outfit-selected-remove-${item.id}`}
                      onClick={() =>
                        setSelectedItems((current) =>
                          current.filter((entry) => entry.id !== item.id),
                        )
                      }
                      type="button"
                      variant="ghost"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
            <section className="outfit-builder__column">
              <h3>Available Items</h3>
              {isLoadingInventory ? <p className="outfit-builder__hint">Loading inventory...</p> : null}
              <ul className="outfit-builder__list" data-testid="outfit-available-items">
                {availableToAdd.map((item) => (
                  <li
                    key={item.id}
                    className="outfit-builder__item"
                    data-testid={`outfit-available-item-${item.id}`}
                  >
                    <img alt={item.title} src={item.frontImageUrl} />
                    <div>
                      <strong>{item.title}</strong>
                      <p>
                        {item.color} · {item.type}
                      </p>
                    </div>
                    <Button
                      data-testid={`outfit-available-add-${item.id}`}
                      onClick={() =>
                        setSelectedItems((current) => {
                          if (current.some((entry) => entry.id === item.id)) {
                            return current;
                          }

                          return [...current, item];
                        })
                      }
                      type="button"
                      variant="ghost"
                    >
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          {error ? <p className="field__error">{error}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
