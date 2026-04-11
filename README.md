# CRM System Client

Modern CRM client built with React, TypeScript, and Vite.

## Current Status

- The app currently renders a temporary landing page: `Briefly CRM`.
- Routing is set up with `react-router-dom` and currently maps `/` to the landing page.
- Core asset and shared component structure is in place for upcoming CRM modules.
- Feature folders for CRM domains exist as scaffolding and are ready for implementation.

## Tech Stack (Current)

- React `19`
- TypeScript `6`
- Vite `8`
- Tailwind CSS `4` via `@tailwindcss/vite`
- React Router (`react-router-dom`, `react-router-hash-link`)
- SVG as React components via `vite-plugin-svgr`
- ESLint `9` + `typescript-eslint`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Type-check and create production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open in browser:

   [http://localhost:5173](http://localhost:5173)

## Current Project Structure

```text
src/
  App.tsx
  main.tsx
  index.css
  router.tsx
  vite-env.d.ts

  core/
    assets/
      icons/
        dashboard/
        form/
        landing/
        logo/
        navbar/
        sidebar/
        social/
      images/
      index.ts
    components/
      Icon.tsx
      Image.tsx
      index.ts

  features/
    landing/
      LandingPage.tsx
    Analytics/
    Companies/
    Contacts/
    Customers/
    Deals/
    Employess/
    OnBoarding/
    Orders/
    Profile/
    settings/
    Tickets/
```

## Notes

- `src/features/landing/LandingPage.tsx` is currently the only implemented feature page.
- Other feature directories are present as scaffolds for future CRM development.
