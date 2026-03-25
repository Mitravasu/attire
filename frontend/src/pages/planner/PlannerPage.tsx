import { useEffect, useMemo, useState } from "react";
import { listOutfits } from "api/outfits/listOutfits";
import { createPlannerEntry } from "api/planner/createPlannerEntry";
import { deletePlannerEntry } from "api/planner/deletePlannerEntry";
import { listPlannerEntries } from "api/planner/listPlannerEntries";
import { PlannerLayout } from "app/layouts/PlannerLayout";
import { PageLayout } from "app/layouts/PageLayout";
import { useToast } from "components/feedback/ToastProvider";
import { EmptyState } from "components/feedback/EmptyState";
import { ErrorState } from "components/feedback/ErrorState";
import { PlannerSidebar } from "components/planner/PlannerSidebar";
import { PlannerWeekView } from "components/planner/PlannerWeekView";
import { Button } from "components/ui/Button";
import { Card } from "components/ui/Card";
import {
  addDays,
  formatDateKey,
  formatDayLabel,
  formatLongDate,
  startOfWeek,
} from "lib/date";
import { downloadSimplePdf } from "lib/pdf";
import { Outfit } from "types/outfit";
import { PlannerEntry } from "types/planner";

export function PlannerPage() {
  const { pushToast } = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [entries, setEntries] = useState<PlannerEntry[]>([]);
  const [sidebarOutfits, setSidebarOutfits] = useState<Outfit[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarError, setSidebarError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarPage, setSidebarPage] = useState(1);
  const [sidebarTotalPages, setSidebarTotalPages] = useState(1);
  const [sidebarRequestVersion, setSidebarRequestVersion] = useState(0);
  const [plannerRequestVersion, setPlannerRequestVersion] = useState(0);
  const [activeDropDate, setActiveDropDate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) => {
        const date = addDays(weekStart, index);
        return {
          date: formatDateKey(date),
          label: formatDayLabel(date),
        };
      }),
    [weekStart],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPlannerEntries() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listPlannerEntries({
          start: days[0]?.date ?? "",
          end: days[6]?.date ?? "",
        });

        if (!cancelled) {
          setEntries(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load planner entries.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPlannerEntries();

    return () => {
      cancelled = true;
    };
  }, [days, plannerRequestVersion]);

  useEffect(() => {
    let cancelled = false;

    async function loadSidebarOutfits() {
      setIsSidebarLoading(true);
      setSidebarError(null);

      try {
        const response = await listOutfits({
          q: searchQuery || undefined,
          page: sidebarPage,
          pageSize: 6,
        });

        if (!cancelled) {
          setSidebarOutfits(response.items);
          setSidebarTotalPages(response.pagination.totalPages);
        }
      } catch (loadError) {
        if (!cancelled) {
          setSidebarError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load sidebar outfits.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsSidebarLoading(false);
        }
      }
    }

    void loadSidebarOutfits();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, sidebarPage, sidebarRequestVersion]);

  async function handleCreatePlannerEntry(outfitId: string, date: string) {
    if (!outfitId || !date) {
      return;
    }

    try {
      const entry = await createPlannerEntry({ outfitId, date });
      setEntries((current) => [entry, ...current]);
      pushToast("Outfit planned.");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Failed to plan outfit.");
      setPlannerRequestVersion((current) => current + 1);
    }
  }

  async function handleRemovePlannerEntry(entryId: string) {
    try {
      await deletePlannerEntry(entryId);
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
      pushToast("Planned outfit removed.");
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "Failed to remove planned outfit.",
      );
      setPlannerRequestVersion((current) => current + 1);
    }
  }

  const selectedTargetDate = selectedDates[0] ?? null;
  const visibleDates = days.map((day) => day.date);
  const offscreenSelectedCount = selectedDates.filter(
    (date) => !visibleDates.includes(date),
  ).length;

  async function handleExportPdf() {
    if (!selectedDates.length) {
      return;
    }

    setIsExporting(true);

    try {
      const sortedDates = [...selectedDates].sort();
      const response = await listPlannerEntries({
        start: sortedDates[0] ?? "",
        end: sortedDates[sortedDates.length - 1] ?? "",
      });
      const selectedEntries = response.filter((entry) =>
        selectedDates.includes(entry.date),
      );
      const uniqueItems = Array.from(
        new Map(
          selectedEntries.flatMap((entry) =>
            entry.outfit.items.map((item) => [item.id, item] as const),
          ),
        ).values(),
      );

      const lines = [
        "Attire Packing List",
        "",
        `Date range: ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`,
        "",
        "Unique Clothing Items",
        ...(
          uniqueItems.length
            ? uniqueItems.map((item) => `- ${item.title} (${item.color}, ${item.type})`)
            : ["- No clothing items found for the selected dates"]
        ),
        "",
        "Daily Outfits",
        ...sortedDates.flatMap((date) => {
          const dayEntries = selectedEntries.filter((entry) => entry.date === date);
          const dayLines = dayEntries.length
            ? dayEntries.flatMap((entry) => [
                `- ${entry.outfit.name} (${entry.outfit.items.length} items)`,
                ...entry.outfit.items.map((item) => `  - ${item.title}`),
              ])
            : ["- No outfit planned"];

          return [formatLongDate(date), ...dayLines, ""];
        }),
      ];

      const filename = `packing-list-${sortedDates[0]}-to-${sortedDates[sortedDates.length - 1]}.pdf`;
      downloadSimplePdf(filename, lines);
      pushToast("Packing list PDF exported.");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <PageLayout
      title="Planner"
      description="The planner now uses a vertical week layout, with each day rendered as its own row alongside week navigation and day selection."
      actions={
        <div className="page-actions">
          <span className="page-actions__meta">
            Selected days: {selectedDates.length}
          </span>
          {selectedDates.length ? (
            <Button data-testid="planner-clear-selection" onClick={() => setSelectedDates([])} variant="ghost">
              Clear Selection
            </Button>
          ) : null}
          <Button
            data-testid="planner-export-pdf"
            disabled={!selectedDates.length || isExporting}
            onClick={() => void handleExportPdf()}
          >
            {isExporting ? "Exporting..." : `Export PDF (${selectedDates.length})`}
          </Button>
          <Button
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            variant="ghost"
          >
            Previous Week
          </Button>
          <Button onClick={() => setWeekStart(startOfWeek(new Date()))} variant="ghost">
            Today
          </Button>
          <Button
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            variant="ghost"
          >
            Next Week
          </Button>
        </div>
      }
    >
      <PlannerLayout
        calendar={
          <Card title="Week View">
            {offscreenSelectedCount > 0 ? (
              <p className="planner-offscreen-note">
                {offscreenSelectedCount} selected day
                {offscreenSelectedCount === 1 ? "" : "s"} outside the visible week.
              </p>
            ) : null}
            {isLoading ? (
              <EmptyState
                title="Loading planner"
                description="Fetching planned outfits for the visible week."
              />
            ) : null}
            {!isLoading && error ? (
              <ErrorState
                action={
                  <Button onClick={() => setWeekStart(new Date(weekStart))}>Retry</Button>
                }
                description="The planner request did not complete. Check the backend or try again."
                title={error}
              />
            ) : null}
            {!isLoading && !error ? (
              <PlannerWeekView
                activeDropDate={activeDropDate}
                days={days}
                entries={entries}
                onDragTargetChange={setActiveDropDate}
                onDropOutfit={handleCreatePlannerEntry}
                onRemoveEntry={handleRemovePlannerEntry}
                onToggleDate={(date, checked) =>
                  setSelectedDates((current) =>
                    checked
                      ? [...current, date]
                      : current.filter((entryDate) => entryDate !== date),
                  )
                }
                selectedDates={selectedDates}
              />
            ) : null}
          </Card>
        }
        sidebar={
          <Card title="Search Outfits">
            {sidebarError ? (
              <ErrorState
                action={
                  <Button
                    onClick={() =>
                      setSidebarRequestVersion((current) => current + 1)
                    }
                  >
                    Retry
                  </Button>
                }
                description="The outfit search request did not complete. Check the backend or try again."
                title={sidebarError}
              />
            ) : null}
            {!sidebarError && !isSidebarLoading && sidebarOutfits.length === 0 ? (
              <EmptyState
                title="No matching outfits"
                description="Adjust the search query to find outfits by name, item title, or tags."
              />
            ) : null}
            {!sidebarError && (isSidebarLoading || sidebarOutfits.length > 0) ? (
              <PlannerSidebar
                currentPage={sidebarPage}
                isLoading={isSidebarLoading}
                onAssignToDate={(outfit, date) =>
                  void handleCreatePlannerEntry(outfit.id, date)
                }
                onPageChange={setSidebarPage}
                onQueryChange={(value) => {
                  setSidebarPage(1);
                  setSearchQuery(value);
                }}
                outfits={sidebarOutfits}
                query={searchQuery}
                selectedTargetDate={selectedTargetDate}
                totalPages={sidebarTotalPages}
              />
            ) : null}
          </Card>
        }
      />
    </PageLayout>
  );
}
