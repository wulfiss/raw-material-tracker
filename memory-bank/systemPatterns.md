# System Patterns: Raw Material Tracker

## Architecture
- **Framework:** SvelteKit (Svelte 5)
- **Styling:** Tailwind CSS (via `@tailwindcss/vite`)
- **UI Components:** `shadcn-svelte`
- **Data Layer:** Server-side mock database in `src/lib/server/mock-db.ts`
- **Deployment Target:** Vercel

## Data Management Patterns
- **Hybrid Data Model (Migration Strategy):** The system uses a dual-model pattern to manage the transition from legacy data to a new, structured schema. 
    - `OldMaterial`/`OldReceipt` types are maintained for backward compatibility.
    - New `Material`/`Reception` types are being introduced.
    - A normalization layer (e.g., `listReceipts`) maps legacy data into the new structure so UI components can remain largely agnostic of the version.
- **Mock Persistence:** Data is stored in-memory within `src/lib/server/mock-db.ts`. While this is not persistent across server restarts, it provides a robust, predictable testing environment.

## Frontend Patterns
- **Reactivity:** Moving towards Svelte 5 runes (e.g., `$derived` for computed properties like filtered lists).
- **Component-Based UI:** Heavy use of headless UI components via `shadcn-svelte`.
- **Mobile-First Design:** Patterns for large tap targets and single-column layouts for the mobile reception mode.

## Development & Quality Assurance
- **Type Safety:** Strict TypeScript usage.
- **Validation:** Form validation (e.g., in `createMaterial`) to prevent duplicate or invalid data entries.
- **Checks:** `npm run check` (svelte-check) is used to maintain code quality and catch type regressions.
