import { Button } from "components/ui/Button";
import { Checkbox } from "components/ui/Checkbox";
import { PlannerEntry } from "types/planner";

type PlannerWeekViewProps = {
  days: { date: string; label: string }[];
  entries: PlannerEntry[];
  selectedDates: string[];
  activeDropDate: string | null;
  onDropOutfit: (outfitId: string, date: string) => void;
  onDragTargetChange: (date: string | null) => void;
  onRemoveEntry: (entryId: string) => void;
  onToggleDate: (date: string, checked: boolean) => void;
};

export function PlannerWeekView({
  days,
  entries,
  selectedDates,
  activeDropDate,
  onDropOutfit,
  onDragTargetChange,
  onRemoveEntry,
  onToggleDate,
}: PlannerWeekViewProps) {
  return (
    <div className="planner-week">
      {days.map((day) => {
        const dayEntries = entries.filter((entry) => entry.date === day.date);

        return (
          <article
            key={day.date}
            data-testid={`planner-day-row-${day.date}`}
            className={
              activeDropDate === day.date
                ? "planner-day-row planner-day-row--active-drop"
                : "planner-day-row"
            }
            onDragLeave={() => onDragTargetChange(null)}
            onDragOver={(event) => {
              event.preventDefault();
              onDragTargetChange(day.date);
            }}
            onDrop={(event) => {
              event.preventDefault();
              const outfitId = event.dataTransfer.getData("text/outfit-id");
              onDropOutfit(outfitId, day.date);
              onDragTargetChange(null);
            }}
          >
            <header className="planner-day-row__header">
              <div>
                <h3>{day.label}</h3>
                <p>{day.date}</p>
              </div>
              <Checkbox
                checked={selectedDates.includes(day.date)}
                id={`planner-date-${day.date}`}
                label="Select day"
                onChange={(event) => onToggleDate(day.date, event.target.checked)}
              />
            </header>
            <div className="planner-day-row__body">
              <div className="planner-day-row__dropzone">
                Drop an outfit here or select this day and use the sidebar action.
              </div>
              {dayEntries.length === 0 ? (
                <p className="planner-day-row__empty">
                  No outfit planned yet. Drop one here or assign from the sidebar.
                </p>
              ) : (
                dayEntries.map((entry) => (
                  <article
                    key={entry.id}
                    className="planned-outfit-card"
                    data-testid={`planner-entry-${entry.id}`}
                  >
                    <div className="planned-outfit-card__preview">
                      {entry.outfit.items.slice(0, 4).map((item) => (
                        <img key={item.id} alt={item.title} src={item.frontImageUrl} />
                      ))}
                    </div>
                    <div className="planned-outfit-card__body">
                      <div className="planned-outfit-card__header">
                        <strong>{entry.outfit.name}</strong>
                        <Button
                          data-testid={`planner-entry-remove-${entry.id}`}
                          onClick={() => onRemoveEntry(entry.id)}
                          type="button"
                          variant="ghost"
                        >
                          Remove
                        </Button>
                      </div>
                      <span>{entry.outfit.items.length} items</span>
                      {entry.notes ? <p>{entry.notes}</p> : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
