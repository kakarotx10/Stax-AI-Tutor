# Stax AI Tutor Design System

## Recommended Stack

Use Tailwind CSS plus shadcn/ui-style primitives across the public site and the authenticated portal.

This fits the current Next.js 14, React 18, TypeScript app because Tailwind is already installed, the portal already uses local UI primitives in `components/ui`, and most screens are custom learning workflows rather than dense enterprise CRUD tables. Ant Design would add a second styling model and a larger component vocabulary than the app currently needs.

## Folder Structure

- `tailwind.config.ts` - central Tailwind theme tokens, typography scale, radius, shadows, and compatibility aliases.
- `app/globals.css` - shadcn-style CSS variables and shared utility classes such as `glass-card`, `btn-primary`, `page-shell`, and `control-input`.
- `components.json` - shadcn/ui project configuration.
- `components/ui/` - shared primitives for app-wide usage.
- `components/Navigation.tsx` - shared public and portal navigation.
- `docs/DESIGN-SYSTEM.md` - design-system reference and migration order.

## Typography

Single font family: Plus Jakarta Sans via `next/font/google`, exposed as `--font-sans`.

| Token | Size | Line height | Weight | Use |
| --- | ---: | ---: | ---: | --- |
| `text-h1` | 3.5rem | 1.05 | 700 | Page titles and hero headlines |
| `text-h2` | 2.5rem | 1.12 | 700 | Major section titles |
| `text-h3` | 2rem | 1.2 | 650 | Card groups and stats |
| `text-h4` | 1.5rem | 1.3 | 650 | Card titles and form headings |
| `text-body-lg` | 1.125rem | 1.75 | 400 | Intro copy |
| `text-body` | 1rem | 1.6 | 400 | Default body copy |
| `text-body-sm` | 0.875rem | 1.5 | 400 | Secondary UI copy |
| `text-caption` | 0.75rem | 1.4 | 500 | Labels and metadata |

Letter spacing is `0` for the type scale to avoid inconsistent condensed headings.

## Tokens

Core color, radius, and shadow tokens live in `app/globals.css` as CSS variables and are consumed by Tailwind names in `tailwind.config.ts`:

- Color: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `border`, `input`, `ring`.
- Radius: `--radius: 0.5rem`, mapped to `rounded-lg`, `rounded-md`, and `rounded-sm`.
- Shadows: `shadow-card` and `shadow-soft`.
- Compatibility aliases: old `neon-*` and `dark-*` names now resolve to the same token system while screens are migrated.

## Migration Order

1. Shared tokens and base styles: `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`.
2. Shared primitives: `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/Card.tsx`.
3. Shared shell: `components/Navigation.tsx` and auth layout/screens.
4. Public pages: home, pricing, and public curriculum components.
5. Portal list/detail screens: contests, interviews, duels, standoffs, marathons, subject flows.
6. High-interaction tools: coding, SQL, frontend editor, personalized assignments.

## Before/After Example

Before:

```tsx
<button className="w-full py-3 rounded-lg font-bold bg-neon-purple text-white hover:bg-neon-purple/80 transition-all">
  Choose Plan
</button>
```

After:

```tsx
<Button variant="secondary" className="w-full">
  Choose Plan
</Button>
```

The new version gets color, spacing, radius, focus, disabled, and hover behavior from the shared design system without changing the click handler or surrounding logic.
