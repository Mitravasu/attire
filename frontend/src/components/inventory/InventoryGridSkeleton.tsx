import { LoadingSkeleton } from "components/feedback/LoadingSkeleton";

type InventoryGridSkeletonProps = {
  count?: number;
};

export function InventoryGridSkeleton({
  count = 6,
}: InventoryGridSkeletonProps) {
  return (
    <div className="inventory-grid">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="inventory-card inventory-card--skeleton">
          <div className="inventory-card__media inventory-card__media--skeleton" />
          <div className="inventory-card__body">
            <LoadingSkeleton lines={3} />
          </div>
        </article>
      ))}
    </div>
  );
}

