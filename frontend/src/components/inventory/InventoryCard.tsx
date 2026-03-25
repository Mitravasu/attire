import { useState } from "react";
import { Button } from "components/ui/Button";
import { InventoryItem } from "types/inventory";

type InventoryCardProps = {
  item: InventoryItem;
  isInDraft: boolean;
  onAddToDraft: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onToggleFavorite: (item: InventoryItem) => void;
};

export function InventoryCard({
  item,
  isInDraft,
  onAddToDraft,
  onDelete,
  onEdit,
  onToggleFavorite,
}: InventoryCardProps) {
  const [showBackImage, setShowBackImage] = useState(false);
  const imageUrl =
    showBackImage && item.backImageUrl ? item.backImageUrl : item.frontImageUrl;

  return (
    <article className="inventory-card" data-testid={`inventory-card-root-${item.id}`}>
      <div className="inventory-card__media">
        <img alt={item.title} className="inventory-card__image" loading="lazy" src={imageUrl} />
        {item.favorite ? <span className="inventory-card__favorite">Favorite</span> : null}
      </div>
      <div className="inventory-card__body">
        <div className="inventory-card__header">
          <h3 data-testid={`inventory-card-item-title-${item.id}`}>{item.title}</h3>
          <span className={`inventory-card__status inventory-card__status--${item.status}`}>
            {item.status}
          </span>
        </div>
        <p className="inventory-card__meta">
          {item.color} · {item.type}
        </p>
        <ul className="inventory-card__tags" aria-label={`${item.title} tags`}>
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="inventory-card__actions">
          <Button
            data-testid={`inventory-card-item-favorite-${item.id}`}
            onClick={() => onToggleFavorite(item)}
            variant="secondary"
          >
            {item.favorite ? "Unfavorite" : "Favorite"}
          </Button>
          <Button
            data-testid={`inventory-card-item-image-toggle-${item.id}`}
            disabled={!item.backImageUrl}
            onClick={() => setShowBackImage((current) => !current)}
            variant="ghost"
          >
            {showBackImage ? "Front" : "Back"}
          </Button>
          <Button
            data-testid={`inventory-card-item-add-to-draft-${item.id}`}
            onClick={() => onAddToDraft(item)}
            variant="ghost"
          >
            {isInDraft ? "In Draft" : "+ Outfit"}
          </Button>
          <Button
            data-testid={`inventory-card-item-edit-${item.id}`}
            onClick={() => onEdit(item)}
            variant="ghost"
          >
            Edit
          </Button>
          <Button
            data-testid={`inventory-card-item-delete-${item.id}`}
            onClick={() => onDelete(item)}
            variant="ghost"
          >
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
