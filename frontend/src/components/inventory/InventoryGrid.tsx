import { InventoryItem } from "types/inventory";
import { InventoryCard } from "./InventoryCard";

type InventoryGridProps = {
  items: InventoryItem[];
  draftItemIds: string[];
  onAddToDraft: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onToggleFavorite: (item: InventoryItem) => void;
};

export function InventoryGrid({
  items,
  draftItemIds,
  onAddToDraft,
  onDelete,
  onEdit,
  onToggleFavorite,
}: InventoryGridProps) {
  return (
    <div className="inventory-grid">
      {items.map((item) => (
        <InventoryCard
          key={item.id}
          isInDraft={draftItemIds.includes(item.id)}
          item={item}
          onAddToDraft={onAddToDraft}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
