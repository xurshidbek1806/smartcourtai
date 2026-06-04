# SmartCourt AI Frontend

Vue 3 + Vite frontend for the SmartCourt AI platform. The app includes the public landing site, citizen portal, judge workspace, admin panel, and oversight module with shared Apple-style monochrome UI components.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:e2e
```

## Main Routes

- `/` marketing landing
- `/portal/dashboard`, `/portal/claims/new`, `/portal/claims/2026-001234`, `/portal/ai-assistant`
- `/judge/dashboard`, `/judge/hearing/live`, `/judge/ai-tools/smart-judge`
- `/admin/dashboard`, `/admin/ai-models`, `/admin/security/audit-log`
- `/oversight/dashboard`, `/oversight/corruption/graph`

## Architecture

- `src/components/ui` shared atomic and molecule components
- `src/layouts` role-specific app shell
- `src/pages` route pages grouped by product area
- `src/data` mock data and navigation definitions
- `src/styles` design tokens, layout, responsive rules, dark mode
