import { FormEvent, useEffect, useState } from "react";
import { getFilterOptions } from "api/inventory/getFilterOptions";
import { listInventory } from "api/inventory/listInventory";
import { createOutfit } from "api/outfits/createOutfit";
import { updateInventoryFavorite } from "api/inventory/updateInventoryFavorite";
import { HomeLayout } from "app/layouts/HomeLayout";
import { PageLayout } from "app/layouts/PageLayout";
import { useToast } from "components/feedback/ToastProvider";
import { EmptyState } from "components/feedback/EmptyState";
import { ErrorState } from "components/feedback/ErrorState";
import { AddItemModal } from "components/inventory/AddItemModal";
import { DeleteItemModal } from "components/inventory/DeleteItemModal";
import { DraftOutfitPanel } from "components/inventory/DraftOutfitPanel";
import { EditItemModal } from "components/inventory/EditItemModal";
import { FilterPanel } from "components/inventory/FilterPanel";
import { InventoryGrid } from "components/inventory/InventoryGrid";
import { InventoryGridSkeleton } from "components/inventory/InventoryGridSkeleton";
import { Button } from "components/ui/Button";
import { Card } from "components/ui/Card";
import { Pagination } from "components/ui/Pagination";
import { FilterOptions } from "types/filterOptions";
import { InventoryFilters, InventoryItem } from "types/inventory";

const pageSize = 6;
const defaultFilters: InventoryFilters = {
  status: "",
  color: "",
  type: "",
  favorite: false,
};

export function HomePage() {
  const { pushToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [draftItems, setDraftItems] = useState<InventoryItem[]>([]);
  const [outfitName, setOutfitName] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isSavingOutfit, setIsSavingOutfit] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  async function handleToggleFavorite(item: InventoryItem) {
    const nextFavorite = !item.favorite;

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, favorite: nextFavorite } : entry,
      ),
    );

    try {
      await updateInventoryFavorite(item.id, nextFavorite);
      pushToast(nextFavorite ? "Marked as favorite." : "Removed favorite.");
    } catch (toggleError) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, favorite: item.favorite } : entry,
        ),
      );
      pushToast(
        toggleError instanceof Error ? toggleError.message : "Favorite update failed.",
      );
    }
  }

  function handleAddToDraft(item: InventoryItem) {
    setDraftItems((current) => {
      if (current.some((entry) => entry.id === item.id)) {
        pushToast("Item is already in the draft outfit.");
        return current;
      }

      pushToast(`Added ${item.title} to the draft outfit.`);
      return [...current, item];
    });
  }

  function handleRemoveFromDraft(itemId: string) {
    setDraftItems((current) => current.filter((item) => item.id !== itemId));
  }

  function handleClearDraft() {
    setDraftItems([]);
    setOutfitName("");
    setDraftError(null);
    pushToast("Draft outfit cleared.");
  }

  function handleEdit(item: InventoryItem) {
    setEditingItem(item);
  }

  function handleDelete(item: InventoryItem) {
    setDeletingItem(item);
  }

  async function handleSaveOutfit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draftItems.length) {
      setDraftError("Add at least one item to save an outfit.");
      return;
    }

    if (!outfitName.trim()) {
      setDraftError("Outfit name is required.");
      return;
    }

    setDraftError(null);
    setIsSavingOutfit(true);

    try {
      await createOutfit({
        name: outfitName.trim(),
        itemIds: draftItems.map((item) => item.id),
      });
      setDraftItems([]);
      setOutfitName("");
      pushToast("Outfit saved.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save outfit.";
      setDraftError(message);
      pushToast("Outfit save failed.");
    } finally {
      setIsSavingOutfit(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadFilterOptions() {
      try {
        const response = await getFilterOptions();

        if (!cancelled) {
          setFilterOptions(response);
        }
      } catch {
        if (!cancelled) {
          setFilterOptions({
            statuses: [],
            colors: [],
            types: [],
          });
        }
      }
    }

    void loadFilterOptions();

    return () => {
      cancelled = true;
    };
  }, [requestVersion]);

  useEffect(() => {
    let cancelled = false;

    async function loadInventory() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listInventory({ page, pageSize, filters });

        if (cancelled) {
          return;
        }

        setItems(response.items);
        setTotalPages(response.pagination.totalPages);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load inventory.";
        setError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInventory();

    return () => {
      cancelled = true;
    };
  }, [filters, page, requestVersion]);

  return (
    <PageLayout
      title="Inventory"
      description="Build the Home screen first: filters on the left, image-first inventory browsing on the right, and room for outfit drafting."
      actions={
        <div className="page-actions">
          <span className="page-actions__meta">Draft items: {draftItems.length}</span>
          <Button onClick={() => setIsAddModalOpen(true)}>Add Item</Button>
        </div>
      }
    >
      <HomeLayout
        rail={
          <Card title="Filters">
            <FilterPanel
              filterOptions={filterOptions}
              filters={filters}
              isLoading={isLoading}
              onChange={(nextFilters) => {
                setPage(1);
                setFilters(nextFilters);
              }}
              onClear={() => {
                setPage(1);
                setFilters(defaultFilters);
              }}
            />
          </Card>
        }
        content={
          <Card title="Inventory Grid">
            {isLoading ? <InventoryGridSkeleton count={pageSize} /> : null}
            {!isLoading && error ? (
              <ErrorState
                action={
                  <Button onClick={() => setRequestVersion((current) => current + 1)}>
                    Retry
                  </Button>
                }
                description="The inventory request did not complete. Check the backend or try the request again."
                title={error}
              />
            ) : null}
            {!isLoading && !error && items.length === 0 ? (
              <EmptyState
                title="No inventory items yet"
                description="Inventory cards will appear here once items exist in the catalog."
              />
            ) : null}
            {!isLoading && !error && items.length > 0 ? (
              <>
                <DraftOutfitPanel
                  draftItems={draftItems}
                  error={draftError}
                  isSaving={isSavingOutfit}
                  onClear={handleClearDraft}
                  onNameChange={setOutfitName}
                  onRemoveItem={handleRemoveFromDraft}
                  onSave={handleSaveOutfit}
                  outfitName={outfitName}
                />
                <InventoryGrid
                  draftItemIds={draftItems.map((item) => item.id)}
                  items={items}
                  onAddToDraft={handleAddToDraft}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onToggleFavorite={handleToggleFavorite}
                />
                <div className="inventory-grid__footer">
                  <Pagination
                    currentPage={page}
                    onPageChange={setPage}
                    totalPages={totalPages}
                  />
                </div>
              </>
            ) : null}
          </Card>
        }
      />
      {isAddModalOpen ? (
        <AddItemModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            setPage(1);
            setRequestVersion((current) => current + 1);
          }}
        />
      ) : null}
      {editingItem ? (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={(updatedItem) => {
            setItems((current) =>
              current.map((entry) =>
                entry.id === updatedItem.id ? updatedItem : entry,
              ),
            );
            setEditingItem(null);
          }}
        />
      ) : null}
      {deletingItem ? (
        <DeleteItemModal
          item={deletingItem}
          onClose={() => setDeletingItem(null)}
          onSuccess={(deletedItem) => {
            setItems((current) =>
              current.filter((entry) => entry.id !== deletedItem.id),
            );
            setDraftItems((current) =>
              current.filter((entry) => entry.id !== deletedItem.id),
            );
            setDeletingItem(null);
            setRequestVersion((current) => current + 1);
          }}
        />
      ) : null}
    </PageLayout>
  );
}
