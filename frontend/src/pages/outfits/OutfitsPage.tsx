import { useEffect, useState } from "react";
import { listOutfits } from "api/outfits/listOutfits";
import { OutfitsLayout } from "app/layouts/OutfitsLayout";
import { PageLayout } from "app/layouts/PageLayout";
import { useToast } from "components/feedback/ToastProvider";
import { DeleteOutfitModal } from "components/outfits/DeleteOutfitModal";
import { EmptyState } from "components/feedback/EmptyState";
import { ErrorState } from "components/feedback/ErrorState";
import { EditOutfitModal } from "components/outfits/EditOutfitModal";
import { OutfitsGrid } from "components/outfits/OutfitsGrid";
import { OutfitsGridSkeleton } from "components/outfits/OutfitsGridSkeleton";
import { Button } from "components/ui/Button";
import { Card } from "components/ui/Card";
import { Outfit } from "types/outfit";

export function OutfitsPage() {
  const { pushToast } = useToast();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);
  const [deletingOutfit, setDeletingOutfit] = useState<Outfit | null>(null);

  function handleEdit(outfit: Outfit) {
    setEditingOutfit(outfit);
  }

  function handleDelete(outfit: Outfit) {
    setDeletingOutfit(outfit);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadOutfits() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listOutfits();

        if (!cancelled) {
          setOutfits(response.items);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Failed to load outfits.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOutfits();

    return () => {
      cancelled = true;
    };
  }, [requestVersion]);

  return (
    <PageLayout
      title="Outfits"
      description="Saved outfits live here as a gallery grid, with edit and delete actions added in the next phase."
    >
      <OutfitsLayout>
        <Card title="Outfit Library">
          {isLoading ? <OutfitsGridSkeleton /> : null}
          {!isLoading && error ? (
            <ErrorState
              action={<Button onClick={() => setRequestVersion((current) => current + 1)}>Retry</Button>}
              description="The outfits request did not complete. Check the backend or try again."
              title={error}
            />
          ) : null}
          {!isLoading && !error && outfits.length === 0 ? (
            <EmptyState
              title="No outfits saved yet"
              description="Build an outfit from the Home screen to populate this library."
            />
          ) : null}
          {!isLoading && !error && outfits.length > 0 ? (
            <OutfitsGrid
              onDelete={handleDelete}
              onEdit={handleEdit}
              outfits={outfits}
            />
          ) : null}
        </Card>
      </OutfitsLayout>
      {editingOutfit ? (
        <EditOutfitModal
          outfit={editingOutfit}
          onClose={() => setEditingOutfit(null)}
          onSuccess={(updatedOutfit) => {
            setOutfits((current) =>
              current.map((outfit) =>
                outfit.id === updatedOutfit.id ? updatedOutfit : outfit,
              ),
            );
            setEditingOutfit(null);
          }}
        />
      ) : null}
      {deletingOutfit ? (
        <DeleteOutfitModal
          outfit={deletingOutfit}
          onClose={() => setDeletingOutfit(null)}
          onSuccess={(deletedOutfit) => {
            setOutfits((current) =>
              current.filter((outfit) => outfit.id !== deletedOutfit.id),
            );
            setDeletingOutfit(null);
          }}
        />
      ) : null}
    </PageLayout>
  );
}
