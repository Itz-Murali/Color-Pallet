# Contributing to Color Pallet

Thanks for helping out. Keep contributions small, focused and free of extra weight.

## Ground rules

- **Everything runs in the browser.** No backend, database, API calls, accounts, analytics or telemetry. Pull requests that add any of these will be declined.
- **Keep dependencies low.** Prefer browser APIs. Open an issue before adding a runtime dependency.
- **Color math lives in `src/lib/color`.** Components call these functions; they do not reimplement them.
- **Accessibility is a feature.** New controls need keyboard support, visible focus, and an accessible name.

## Setup

```bash
git clone https://github.com/Itz-Murali/Color-Pallet.git
cd Color-Pallet
npm install
npm run dev
```

Node 20.19+ or 22+ is required.

## Before opening a pull request

```bash
npm run lint    # ESLint
npm test        # Vitest unit tests for the color, gradient and search logic
npm run build   # Type-check (tsc -b) and production build
```

If you change conversion, parsing, contrast, palette or gradient logic, add or update a test in the matching `*.test.ts` file.

## Where things go

| You are adding…                          | Put it in…                          |
| ---------------------------------------- | ----------------------------------- |
| A new color name or collection           | `src/data/named-colors.ts`          |
| Conversion, parsing, contrast, palettes  | `src/lib/color/`                    |
| Gradient CSS or URL logic                | `src/lib/gradient.ts`               |
| A reusable UI piece                      | `src/components/`                   |
| Site name, logo or creator details       | `src/data/site.ts`                  |
| A tool-specific component                | `src/features/<tool>/`              |
| A new route                              | `src/pages/` and `src/lib/router.ts` |

## Style

- TypeScript strict mode, no `any`.
- Small components; extract logic into `lib/` or a hook instead of growing a component.
- Tailwind utilities with the semantic tokens defined in `src/index.css` (`bg-panel`, `text-muted-foreground`, `border-border-strong`, …). Do not hard-code neutral colors.
- No emoji in the interface; icons come from Lucide.

## Reporting bugs

Include the color value or URL that reproduces the problem, your browser, and what you expected.
