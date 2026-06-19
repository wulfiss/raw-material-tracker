# Progress: Raw Material Tracker

## What's Working
- **Mock Data Layer:** `src/lib/server/mock-db.ts` is established with a hybrid model (Old vs New) for backward compatibility.
- **Material Master Data (Partial):** Basic material types and mock data are in place.
- **Mock Data Scenarios:** Enhanced mock reception data includes scenarios for Expired, Near Expiry, and Missing Expiration.
- **Environment Setup:** Project structure is initialized and memory bank is created.

## What's Left to Build
- **Phase 1 (In Progress):**
  - [ ] Standardize and refine `ReceptionFilters` and `SavedView` types.
  - [ ] Resolve TypeScript errors from `npm run check` (e.g., missing imports, implicit `any`, `requestSubmit` issues).
  - [ ] Complete Phase 1 implementation.
- **Phase 2:** Material Master Data Page (CRUD).
- **Phase 3:** Reception Form Material Integration (Searchable Select).
- **Phase 4:** Expiration Alert Dashboard & Badges.
- **Phase 5:** Advanced Filters & Saved Views.
- **Phase 6:** CSV Export & Print Reports.
- **Phase 7:** Mobile Reception Mode.

## Known Issues
- **TypeScript Errors (from `npm run check`):**
  - `src/routes/materials/new/+page.server.ts`: `isMaterialUnit` not found.
  - `src/routes/receipts/new/+page.server.ts`: Missing `listActiveMaterials` import.
  - `src/routes/materials/+page.svelte`: Deprecated `on:submit` usage.
  - `src/routes/materials/+page.svelte`: `requestSubmit` type error on `HTMLElement`.
  - `src/routes/materials/[id]/edit/+page.svelte`: Type error on `data.loadError.message`.
  - `src/routes/receipts/new/+page.svelte`: Implicit `any` on `material` parameter.
  - `src/routes/receipts/new/+page.svelte`: Implicit `any` on `material` parameter in filter.

## Evolution of Project Decisions
- **Data Layer:** Decided to use a hybrid mock data approach in `src/lib/server/mock-db.ts` to allow a gradual migration to a new schema without breaking existing UI.
- **State Management:** Moving towards Svelte 5 runes (`$derived`, etc.) for reactivity.
