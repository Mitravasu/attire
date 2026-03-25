# Playwright E2E Test Plan

## Goal

Add end-to-end coverage for the highest-risk user flows that are already implemented:

- Home inventory management
- Outfits gallery management
- Planner scheduling and export
- Cross-screen navigation and app-shell stability

The first milestone should cover the happy paths and the most important regressions. Negative-path and accessibility-focused coverage can expand after the base suite is stable.

## Scope

### In Scope for the First Pass

- App shell navigation between `Home`, `Outfits`, and `Planner`
- Home inventory loading, filtering, create, edit, delete, favorite, and draft outfit flows
- Outfits gallery rendering plus edit and delete flows
- Planner week navigation, sidebar search, assignment, removal, and PDF export trigger
- Mobile-leaning smoke coverage for the main responsive layouts

### Out of Scope for the First Pass

- Authentication
- Hosted Nginx / Cloudflare Tunnel deployment validation
- Visual snapshot testing
- Browser matrix beyond Chromium
- Full keyboard accessibility certification
- HTML-to-print PDF export, since it is not implemented yet

## Test Strategy

### Layering

- Keep Playwright focused on true user journeys, not component-level behavior.
- Use backend seed data as the baseline for deterministic tests.
- Prefer API-assisted setup and cleanup where possible instead of driving all state through the UI.
- Keep one small smoke suite for local iteration and one broader regression suite for pre-merge verification.

### Execution Model

- Start the frontend and backend locally in the test runner.
- Run tests against the local seeded backend, not mocked network responses.
- Isolate tests so one test can fail without poisoning the next one.
- Avoid depending on mutable seeded records when the test will edit or delete them.

### Data Model Assumptions

Current backend state is in-memory and seeded on boot. That is good for E2E because it gives us a reset point every run. The suite should treat server restart as the canonical reset mechanism.

## Proposed Suite Structure

```text
tests/e2e/
  smoke/
    app-shell.spec.ts
  home/
    inventory-browse.spec.ts
    inventory-create.spec.ts
    inventory-edit-delete.spec.ts
    draft-outfit.spec.ts
  outfits/
    outfits-gallery.spec.ts
    outfits-edit-delete.spec.ts
  planner/
    planner-navigation.spec.ts
    planner-assignment.spec.ts
    planner-export.spec.ts
  fixtures/
    inventory.ts
    outfits.ts
    planner.ts
  utils/
    test-ids.ts
    uploads.ts
```

This structure keeps specs aligned to product surfaces rather than implementation files.

## Coverage Plan

## 1. App Shell Smoke

### Objective

Confirm the app boots and the primary routes are reachable.

### Tests

- loads `/` and shows the Home page shell
- navigates to `/outfits` from the top nav
- navigates to `/planner` from the top nav
- preserves active-nav styling or route state at a basic level

### Priority

`P0`

## 2. Home Screen

### 2.1 Inventory Browsing

### Objective

Catch regressions in the main inventory grid and filter rail.

### Tests

- renders seeded inventory cards on initial load
- filters by one criterion and updates the grid
- clears filters and returns to the full dataset
- paginates between inventory pages
- toggles favorite and persists the updated state in the UI

### Priority

`P0`

### 2.2 Add Item

### Objective

Verify the create modal and file upload flow.

### Tests

- opens and closes the add-item modal
- blocks submit when required fields are missing
- creates a new inventory item with front image upload
- optionally uploads a back image
- shows success feedback and refreshes the grid after create

### Priority

`P0`

### 2.3 Edit and Delete Item

### Objective

Verify the destructive and update paths for inventory.

### Tests

- opens the edit modal with prefilled values
- saves an edited title or metadata field and updates the card
- opens the delete confirmation modal
- deletes a newly created item and removes it from the grid

### Priority

`P0`

### 2.4 Draft Outfit Builder

### Objective

Verify the cross-screen flow that produces outfits consumed elsewhere.

### Tests

- adds inventory items to the draft builder
- prevents duplicate draft adds
- requires an outfit name before save
- saves a draft outfit and shows success feedback
- confirms the saved outfit appears on the Outfits page

### Priority

`P0`

## 3. Outfits Screen

### 3.1 Gallery

### Objective

Ensure the saved outfit library renders seeded and newly created outfits correctly.

### Tests

- renders seeded outfits on load
- shows preview images and item counts
- surfaces the empty state when the backend is reset without outfits, if we add a test-only reset mode later

### Priority

`P1`

### 3.2 Edit and Delete Outfit

### Objective

Cover the main outfit maintenance flows.

### Tests

- opens the edit modal from an outfit card
- adds or removes an inventory item in the edit modal
- saves the updated outfit and refreshes the card content
- opens the delete confirmation modal
- deletes a newly created outfit and removes it from the gallery

### Priority

`P0`

## 4. Planner Screen

### 4.1 Week Navigation and Layout

### Objective

Protect the vertical week planner behavior the product now depends on.

### Tests

- loads planner rows for the visible week
- moves to next week and previous week
- returns to the current week with `Today`
- keeps the planner in the row-per-day vertical layout at a basic smoke level

### Priority

`P0`

### 4.2 Sidebar Search and Assignment

### Objective

Verify planners can schedule outfits without relying on a fragile drag-only path.

### Tests

- searches the sidebar outfits by name
- selects a day and assigns an outfit using the explicit sidebar action
- confirms the planned outfit appears in the correct day row
- optionally covers drag-and-drop once the base selector strategy is stable

### Priority

`P0`

### 4.3 Remove Planned Outfit

### Objective

Verify planner cleanup and row updates.

### Tests

- removes a planned outfit from a day row
- confirms the row updates back to its empty or reduced state

### Priority

`P0`

### 4.4 PDF Export

### Objective

Verify selection and export behavior without over-testing PDF internals.

### Tests

- selects multiple planner days
- shows the selected-day count in the export UI
- starts a PDF download with the expected filename pattern
- clears selected dates

### Priority

`P1`

## 5. Responsive Smoke

### Objective

Catch the highest-value mobile regressions early.

### Tests

- Home page renders inventory cards and card actions at a mobile viewport
- Outfits page renders card actions at a mobile viewport
- Planner page renders day rows and sidebar action path at a mobile viewport

### Priority

`P1`

## Selector Plan

The current UI has readable button and label text, which is enough for an initial suite. For flows that are repeated or visually dense, we should add stable `data-testid` hooks before the suite grows.

Recommended first additions:

- inventory card root, title, favorite button, edit button, delete button, add-to-draft button
- draft outfit panel and save action
- outfit card root, edit button, delete button
- planner day row, planner entry card, sidebar outfit card, assign action
- toast container

Use semantic selectors first. Add `data-testid` only where text selectors would be ambiguous or brittle.

## Test Data and Utilities

### Fixtures

- sample image files for upload tests
- helper for generating unique inventory and outfit names
- helper for waiting on toast and modal lifecycle

### Reset

- preferred: restart backend before each spec file or test project
- optional later improvement: add test-only reset endpoints for inventory, outfits, and planner stores

### Creation Policy

- create records with a unique prefix like `e2e-<timestamp>`
- edit and delete only records created by the running test
- do not mutate seeded items unless the test is explicitly a read-only smoke case

## Risk Areas

These are the flows most likely to be flaky without a little hardening first:

- drag-and-drop in the planner
- toast assertions if timing is too tight
- modal focus handling because we have not completed UX hardening yet
- selectors on repeated card grids without dedicated test ids

For that reason, the first implementation pass should favor:

- explicit sidebar assignment over drag-and-drop
- DOM state assertions over transient animation assertions
- created test data over editing seeded data

## Recommended Build Order

1. Add Playwright config and local scripts.
2. Add upload fixtures and a tiny test utility layer.
3. Add one smoke spec for app-shell navigation.
4. Add `P0` Home create/edit/delete coverage.
5. Add `P0` draft outfit to Outfits verification coverage.
6. Add `P0` Planner assign/remove coverage using the non-drag fallback.
7. Add `P1` PDF download and mobile smoke coverage.
8. Add drag-and-drop coverage only after the rest of the suite is stable.

## Definition of Done for the First E2E Milestone

- Playwright is wired into repo scripts
- local `npm` command exists to run the E2E suite
- at least one `P0` spec exists for each main product screen
- tests pass against a fresh local boot of frontend and backend
- suite is stable enough to run twice in a row without intermittent failures
