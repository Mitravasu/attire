import { Outfit } from "types/outfit";
import { OutfitCard } from "./OutfitCard";

type OutfitsGridProps = {
  outfits: Outfit[];
  onDelete: (outfit: Outfit) => void;
  onEdit: (outfit: Outfit) => void;
};

export function OutfitsGrid({ outfits, onDelete, onEdit }: OutfitsGridProps) {
  return (
    <div className="outfits-grid">
      {outfits.map((outfit) => (
        <OutfitCard
          key={outfit.id}
          onDelete={onDelete}
          onEdit={onEdit}
          outfit={outfit}
        />
      ))}
    </div>
  );
}
