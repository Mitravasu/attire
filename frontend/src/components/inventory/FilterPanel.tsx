import { Checkbox } from "components/ui/Checkbox";
import { Select } from "components/ui/Select";
import { Button } from "components/ui/Button";
import { FilterOptions } from "types/filterOptions";
import { InventoryFilters } from "types/inventory";

type FilterPanelProps = {
  filterOptions: FilterOptions | null;
  filters: InventoryFilters;
  isLoading: boolean;
  onChange: (nextFilters: InventoryFilters) => void;
  onClear: () => void;
};

export function FilterPanel({
  filterOptions,
  filters,
  isLoading,
  onChange,
  onClear,
}: FilterPanelProps) {
  return (
    <div className="filter-panel">
      <p className="filter-rail__intro">
        Refine the wardrobe by status, color, type, or favorites. Filters refresh
        the inventory grid immediately.
      </p>
      <Select
        disabled={isLoading || !filterOptions}
        id="inventory-status-filter"
        label="Status"
        onChange={(event) =>
          onChange({
            ...filters,
            status: event.target.value as InventoryFilters["status"],
          })
        }
        options={[
          { label: "All statuses", value: "" },
          ...(filterOptions?.statuses.map((status) => ({
            label: status[0].toUpperCase() + status.slice(1),
            value: status,
          })) ?? []),
        ]}
        value={filters.status}
      />
      <Select
        disabled={isLoading || !filterOptions}
        id="inventory-color-filter"
        label="Color"
        onChange={(event) =>
          onChange({
            ...filters,
            color: event.target.value,
          })
        }
        options={[
          { label: "All colors", value: "" },
          ...(filterOptions?.colors.map((color) => ({
            label: color[0].toUpperCase() + color.slice(1),
            value: color,
          })) ?? []),
        ]}
        value={filters.color}
      />
      <Select
        disabled={isLoading || !filterOptions}
        id="inventory-type-filter"
        label="Type"
        onChange={(event) =>
          onChange({
            ...filters,
            type: event.target.value as InventoryFilters["type"],
          })
        }
        options={[
          { label: "All types", value: "" },
          ...(filterOptions?.types.map((type) => ({
            label: type[0].toUpperCase() + type.slice(1),
            value: type,
          })) ?? []),
        ]}
        value={filters.type}
      />
      <Checkbox
        checked={filters.favorite}
        id="inventory-favorite-filter"
        label="Favorites only"
        onChange={(event) =>
          onChange({
            ...filters,
            favorite: event.target.checked,
          })
        }
      />
      <Button disabled={isLoading} onClick={onClear} variant="ghost">
        Clear All Filters
      </Button>
    </div>
  );
}

