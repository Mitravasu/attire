import { LoadingSkeleton } from "components/feedback/LoadingSkeleton";

type OutfitsGridSkeletonProps = {
  count?: number;
};

export function OutfitsGridSkeleton({
  count = 6,
}: OutfitsGridSkeletonProps) {
  return (
    <div className="outfits-grid">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="outfit-card">
          <div className="outfit-card__preview outfit-card__preview--skeleton" />
          <div className="outfit-card__body">
            <LoadingSkeleton lines={3} />
          </div>
        </article>
      ))}
    </div>
  );
}

