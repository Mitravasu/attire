import { Button } from "components/ui/Button";
import { Input } from "components/ui/Input";
import { Pagination } from "components/ui/Pagination";
import { Outfit } from "types/outfit";

type PlannerSidebarProps = {
  outfits: Outfit[];
  query: string;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  selectedTargetDate: string | null;
  onAssignToDate: (outfit: Outfit, date: string) => void;
  onQueryChange: (value: string) => void;
  onPageChange: (page: number) => void;
};

export function PlannerSidebar({
  outfits,
  query,
  isLoading,
  currentPage,
  totalPages,
  selectedTargetDate,
  onAssignToDate,
  onQueryChange,
  onPageChange,
}: PlannerSidebarProps) {
  return (
    <div className="planner-sidebar" data-testid="planner-sidebar">
      <Input
        id="planner-outfit-search"
        label="Search outfits"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by outfit, item, or tag"
        value={query}
      />
      {isLoading ? <p className="planner-sidebar__hint">Searching outfits...</p> : null}
      <ul className="planner-sidebar__list" data-testid="planner-sidebar-list">
        {outfits.map((outfit) => (
          <li
            key={outfit.id}
            className="planner-sidebar__item"
            data-testid={`planner-sidebar-outfit-${outfit.id}`}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/outfit-id", outfit.id);
            }}
          >
            <div className="planner-sidebar__preview">
              {outfit.items.slice(0, 3).map((item) => (
                <img key={item.id} alt={item.title} src={item.frontImageUrl} />
              ))}
            </div>
            <div className="planner-sidebar__copy">
              <strong>{outfit.name}</strong>
              <span>{outfit.items.length} items</span>
            </div>
            {selectedTargetDate ? (
              <Button
                data-testid={`planner-assign-${outfit.id}`}
                onClick={() => onAssignToDate(outfit, selectedTargetDate)}
                type="button"
                variant="ghost"
              >
                Assign to selected day
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        totalPages={totalPages}
      />
    </div>
  );
}
