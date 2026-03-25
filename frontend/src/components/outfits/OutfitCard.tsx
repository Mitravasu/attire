import { Button } from "components/ui/Button";
import { Outfit } from "types/outfit";

type OutfitCardProps = {
  outfit: Outfit;
  onDelete: (outfit: Outfit) => void;
  onEdit: (outfit: Outfit) => void;
};

export function OutfitCard({ outfit, onDelete, onEdit }: OutfitCardProps) {
  return (
    <article className="outfit-card" data-testid={`outfit-card-${outfit.id}`}>
      <div className="outfit-card__preview">
        {outfit.items.slice(0, 4).map((item) => (
          <img key={item.id} alt={item.title} src={item.frontImageUrl} />
        ))}
      </div>
      <div className="outfit-card__body">
        <div className="outfit-card__header">
          <h3 data-testid={`outfit-card-title-${outfit.id}`}>{outfit.name}</h3>
          <div className="outfit-card__actions outfit-card__actions--desktop">
            <Button
              data-testid={`outfit-card-edit-${outfit.id}`}
              onClick={() => onEdit(outfit)}
              variant="ghost"
            >
              Edit
            </Button>
            <Button
              data-testid={`outfit-card-delete-${outfit.id}`}
              onClick={() => onDelete(outfit)}
              variant="ghost"
            >
              Delete
            </Button>
          </div>
        </div>
        <p>{new Date(outfit.createdAt).toLocaleDateString()}</p>
        <span>{outfit.items.length} items</span>
        <div className="outfit-card__actions outfit-card__actions--mobile">
          <Button onClick={() => onEdit(outfit)} variant="ghost">
            Edit
          </Button>
          <Button onClick={() => onDelete(outfit)} variant="ghost">
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
