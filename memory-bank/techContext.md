# Tech Context: Raw Material Tracker

## Core Technology Stack
- **Runtime/Framework:** SvelteKit (Svelte 5)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS 4.3.1
- **Component Library:** `shadcn-svelte` (Radix-based headless components)
- **Build Tooling:** Vite, `svelte-check`, `svelte-kit`

## Development Setup
- **Package Manager:** `npm`
- **Key Scripts:**
  - `npm run dev`: Starts the Vite development server.
  - `npm run build`: Builds the application for production.
  - `npm run check`: Runs Svelte-check to validate code and types.
- **Environment:** Node.js (via `package.json` dependencies)

## Dependencies
- `@sveltejs/kit`: The SvelteKit framework.
- `@sveltejs/adapter-vercel`: Deployment adapter for Vercel.
- `@lucide/svelte`: Icon library.
- `class-variance-authority`, `clsx`, `tailwind-merge`: Utility for building type-safe, composable UI components (standard shadcn/ui pattern).
- `headroom-ai`: AI-related utility.

## Tooling & Workflow
- **Type Checking:** Heavily reliant on TypeScript for safety, especially in the mock data layer.
- **Styling Workflow:** Utility-first with Tailwind and `shadcn-svelte` for rapid, consistent UI development.
- **Code Quality:** `svelte-check` is used to catch deprecated syntax (e.g., `on:submit`) and TypeScript errors.
