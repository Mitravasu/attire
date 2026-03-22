# Application Overview

## Purpose

Attire is a wardrobe management application that helps users:

- catalog clothing items with images and metadata
- build reusable outfits from saved inventory
- plan outfits across a weekly calendar
- export selected planned days into a packing list PDF

## Application Structure

The app is organized into three primary areas:

- `Home` (`/`): inventory management, filtering, and outfit creation
- `Outfits` (`/outfits`): saved outfit library management
- `Planner` (`/planner`): weekly scheduling and packing-list export

## User Flows

### 1. Add a New Inventory Item

Entry point:

- Click `Add Item` on the Home page.

Flow:

1. The add-item modal opens.
2. The user enters a title.
3. The user uploads a required front image.
4. The user optionally uploads a back image.
5. The user adds comma-separated tags.
6. The user selects color, type, and status.
7. The user submits the form.
8. The app validates required fields, file type, and file size.
9. The item is posted to the backend and stored in inventory.

Current rules:

- Front image is required.
- Back image is optional.
- Images must be valid image files.
- Image size is limited to 5 MB.
- Title and tags are required.

### 2. Browse Inventory

Entry point:

- Home page default view.

Flow:

1. The inventory grid loads from the backend.
2. Items display as image-first cards.
3. The user scrolls through the card grid.
4. Images lazy-load as cards enter view.
5. Pagination supports moving through the inventory.

Each inventory card supports:

- toggle favorite
- switch between front and back image
- add item to the current outfit
- edit item
- delete item

### 3. Filter Inventory

Entry point:

- Filter panel on the Home page.

Flow:

1. The app loads filter values from the backend.
2. The user filters by status, color, type, or favorite state.
3. The inventory grid refreshes based on the selected filters.
4. The user can clear all filters in one action.

### 4. Favorite an Inventory Item

Entry point:

- Heart icon on an inventory card.

Flow:

1. The user clicks the heart icon.
2. The UI updates immediately.
3. The backend saves the new favorite state.
4. If the request fails, the state is reverted.

### 5. Edit an Inventory Item

Entry point:

- Edit action on an inventory card.

Flow:

1. The edit modal opens with existing item values.
2. Current images are shown for reference.
3. The user updates text fields, dropdowns, and optionally replaces images.
4. The user saves changes.
5. The inventory grid refreshes after a successful update.

### 6. Delete an Inventory Item

Entry point:

- Delete action on an inventory card.

Flow:

1. A confirmation modal opens.
2. The item name and images are shown.
3. The user confirms deletion.
4. The backend deletes the item.
5. The inventory grid refreshes.

### 7. Build and Save an Outfit

Entry point:

- Home page outfit panel.

Flow:

1. The user clicks `+` on inventory items.
2. Selected items appear in the outfit panel.
3. Duplicate item adds are prevented.
4. The user removes items if needed.
5. The user enters an outfit name.
6. The user saves the outfit.
7. The backend stores the outfit with its associated inventory item IDs.
8. The temporary outfit builder is cleared.

### 8. Clear a Draft Outfit

Entry point:

- Trash icon in the outfit panel.

Flow:

1. The user clicks the clear action.
2. The temporary outfit is reset.
3. Saved outfits are unaffected.

### 9. View Saved Outfits

Entry point:

- Navigate to `/outfits`.

Flow:

1. The app loads saved outfits.
2. Loading skeletons are shown while fetching data.
3. Outfits render in a grid of cards.
4. Each card shows the outfit name, creation date, item count, and item previews.
5. Hovering reveals edit and delete actions.

Supported states:

- loading
- error with retry
- empty state
- populated grid

### 10. Edit a Saved Outfit

Entry point:

- Edit action on an outfit card.

Flow:

1. The edit modal opens with the current outfit name and selected items.
2. Inventory items load into an available-items panel.
3. The user adds or removes items.
4. The user updates the outfit name.
5. The user saves changes.
6. The outfits grid refreshes after success.

### 11. Delete a Saved Outfit

Entry point:

- Delete action on an outfit card.

Flow:

1. A confirmation modal opens.
2. The user confirms deletion.
3. The backend deletes the outfit.
4. Inventory items remain untouched.

### 12. Search Outfits in the Planner Sidebar

Entry point:

- Search field in the planner sidebar.

Flow:

1. The planner sidebar loads outfits.
2. The user searches by outfit name, inventory item title, or tags.
3. Matching outfits are displayed in the sidebar.
4. Results paginate in the sidebar.

### 13. Plan Outfits on the Weekly Calendar

Entry point:

- Planner page.

Flow:

1. The planner opens on the current week.
2. The app loads planner entries for the visible date range.
3. The user drags an outfit from the sidebar onto a day column.
4. The backend creates a planner entry for that day.
5. The selected day updates with the planned outfit.

Planner navigation includes:

- previous week
- next week
- return to current week with `Today`

### 14. Review Planned Outfits

Entry point:

- Planner week view.

Flow:

1. Each day column shows date information and a selection checkbox.
2. Planned outfits display as cards inside the day column.
3. Each planned outfit includes:
   - outfit name
   - item count
   - item image previews
   - optional notes if present in the data
4. Hovering over an item preview shows a larger image tooltip.

### 15. Remove a Planned Outfit

Entry point:

- Remove action on a planned outfit card.

Flow:

1. The user clicks the remove control.
2. The planner entry is deleted.
3. The week view refreshes.

### 16. Select Days for PDF Export

Entry point:

- Checkboxes in planner day headers.

Flow:

1. The user selects one or more days.
2. The export button reflects the selected count.
3. Selections persist while navigating between weeks.
4. The interface indicates when selections include dates outside the current visible week.
5. The user can clear all selected days.

### 17. Export a Packing List PDF

Entry point:

- `Export PDF` button in the Planner header.

Flow:

1. The user selects one or more days.
2. The user clicks `Export PDF`.
3. The app gathers unique clothing items across the selected dates.
4. If selected dates span outside the current week, the app fetches the additional planner data required.
5. A PDF is generated with:
   - a unique clothing items section
   - a daily outfits section grouped by date
6. The file downloads locally with a date-range filename.

## UI/UX Definition

### Core UX Model

- The experience is centered on images first, text second.
- The app uses card-based browsing for both inventory and outfits.
- CRUD actions are primarily modal-based.
- Planning uses direct manipulation through drag-and-drop rather than form entry.

### Layout Pattern

- A persistent top navigation keeps the three major jobs visible.
- The Home page uses a left control rail and a right content area.
- The Outfits page uses a gallery-like grid.
- The Planner page uses a split layout: week view on the left, searchable outfit sidebar on the right.

### Visual Style

- The interface uses a neutral gray-and-white palette.
- Clothing imagery is the strongest visual element throughout the application.
- Rounded corners, shadows, and hover states define interactivity.
- The design is functional and content-driven rather than brand-heavy.

### Interaction Behavior

- Hover states reveal many secondary actions.
- Loading states are present on major surfaces.
- Empty states exist for inventory and outfits.
- Error handling is inconsistent across the app:
  - some flows use inline error messages
  - some flows use alert dialogs
  - some failures only log to the console

### Current UX Strengths

- The product model is easy to understand.
- Visual previews reduce ambiguity when choosing clothes or outfits.
- The planner supports a real, useful workflow for travel and daily preparation.
- Favorites and filters make large wardrobes more manageable.

### Current UX Gaps

- Some key actions do not provide enough visible success feedback.
- Drag-and-drop affordances depend on user discovery.
- Several actions are hover-dependent, which can reduce touch usability.
- Some layouts and modal widths appear tuned for desktop more than mobile.

## Suggestions

### UX Improvements

- Add toast notifications for successful creates, updates, deletes, saves, and exports.
- Replace native `alert()` usage with in-app error messaging.
- Add stronger onboarding copy around drag-and-drop behavior in the planner.
- Preserve and warn about unsaved changes in forms and the draft outfit builder.

### Inventory Improvements

- Refresh the Home inventory grid immediately after a successful add.
- Add text search by title and tags.
- Add sort controls such as newest, favorites, and recently updated.
- Add bulk actions for larger wardrobes.

### Outfit Improvements

- Add a dedicated outfit detail view.
- Support notes, occasions, seasons, or weather tags on outfits.
- Improve confirmation and feedback after saving an outfit from Home.

### Planner Improvements

- Support moving planned outfits between days with explicit move handling.
- Expose planner notes editing directly in the UI.
- Improve duplicate-planning error messages.
- Add additional planner views such as month or agenda view.

### Accessibility Improvements

- Improve keyboard support for modals and planner interactions.
- Strengthen visible focus states.
- Revisit contrast on gray surfaces and disabled controls.
- Reduce reliance on hover-only actions.

### Technical Suggestions

- Standardize frontend API configuration. Some calls use `VITE_API_URL`, while others are hardcoded to `http://localhost:3001`.
- Consolidate notifications and validation into shared patterns.
- Consider server-side outfit search and pagination instead of loading large outfit sets client-side for planner search.
