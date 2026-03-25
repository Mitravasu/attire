import { FormEvent } from "react";
import { Button } from "components/ui/Button";
import { Input } from "components/ui/Input";
import { InventoryItem } from "types/inventory";

type DraftOutfitPanelProps = {
  draftItems: InventoryItem[];
  outfitName: string;
  isSaving: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onRemoveItem: (itemId: string) => void;
  onClear: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
};

export function DraftOutfitPanel({
  draftItems,
  outfitName,
  isSaving,
  error,
  onNameChange,
  onRemoveItem,
  onClear,
  onSave,
}: DraftOutfitPanelProps) {
  const isSaveDisabled = !draftItems.length || !outfitName.trim() || isSaving;

  return (
    <section className="draft-outfit-panel" data-testid="draft-outfit-panel">
      <header className="draft-outfit-panel__header">Draft Outfit</header>
      <div className="draft-outfit-panel__body">
        <form className="draft-outfit" onSubmit={onSave}>
          <Input
            id="draft-outfit-name"
            label="Outfit Name"
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Weekend capsule"
            value={outfitName}
          />
          <div className="draft-outfit__header">
            <span>{draftItems.length} items selected</span>
            <Button disabled={!draftItems.length || isSaving} onClick={onClear} variant="ghost">
              Clear
            </Button>
          </div>
          <ul className="draft-outfit__list" data-testid="draft-outfit-list">
            {draftItems.map((item) => (
              <li
                key={item.id}
                className="draft-outfit__item"
                data-testid={`draft-outfit-item-${item.id}`}
              >
                <img alt={item.title} src={item.frontImageUrl} />
                <div className="draft-outfit__item-copy">
                  <strong>{item.title}</strong>
                  <span>
                    {item.color} · {item.type}
                  </span>
                </div>
                <Button onClick={() => onRemoveItem(item.id)} variant="ghost">
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          {!draftItems.length ? (
            <p className="draft-outfit__empty">
              Add items from the grid to build and save an outfit.
            </p>
          ) : null}
          {error ? <p className="field__error">{error}</p> : null}
          <Button data-testid="draft-outfit-save" disabled={isSaveDisabled} type="submit">
            {isSaving ? "Saving..." : "Save Outfit"}
          </Button>
        </form>
      </div>
    </section>
  );
}
