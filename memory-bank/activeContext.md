# Active Context: Raw Material Tracker

## Current Focus
- **Phase 0 (Baseline Inspection):** Analyzing the existing data model and structure to ensure compatibility between legacy and new data formats.
- **Phase 1 (Data Model and Storage):** Preparing to standardize and refine the types and mock data in `src/lib/server/mock-db.ts`.

## Recent Changes
- `src/lib/server/mock-db.ts`: Updated material units and enhanced mock reception data to include test cases for expiration alerts (Expired, Near Expiry, Missing Expiration).

## Next Steps
1. **Refine Phase 1:** Standardize the `ReceptionFilters` and `SavedView` types.
2. **Address Technical Debt:** Resolve TypeScript errors identified during `npm run check` (e.g., missing `isMaterialUnit` import, `requestSubmit` type issues, and implicit `any` in Svelte components).
3. **Implement Phase 1:** Ensure all required types from the implementation plan are strictly implemented.

## Important Decisions
- **Data Storage:** Continuing with the current local/mock storage approach (in-memory) for now. No database migration in this phase.
- **Backward Compatibility:** Maintaining a dual-structure approach (Old vs New) in the mock database to support existing components during transition.
