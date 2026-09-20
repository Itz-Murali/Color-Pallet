<div align="center">

<img src="https://files.catbox.moe/o949te.png" alt="Color Pallet logo" width="120" height="120">

# Color Pallet

**A fast, open-source color toolkit for developers and designers.**

Explore colors, build palettes and gradients, convert formats and check contrast. Runs entirely in your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-black?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-black?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-black?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-black?style=flat-square&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-black?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FItz-Murali%2FColor-Pallet) · [Report a bug](https://github.com/Itz-Murali/Color-Pallet/issues) · [Contribute](CONTRIBUTING.md)

</div>

---

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Shareable URLs](#shareable-urls)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Deploy to Vercel](#deploy-to-vercel)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Privacy](#privacy)
- [Creators](#-creators)
- [Contributing](#contributing)
- [License](#license)

## Features

| Tool | What it does |
| --- | --- |
| **Explorer** | Search 190+ named colors (CSS, Tailwind, developer brands) or type `#hex`, `rgb()`, `hsl()`, `hsv()` and `r, g, b`. Precise picker with hue and alpha, channel editing for HEX, RGB, HSL and HSV, and one-click copy for HEX, RGB, RGBA, HSL, HSLA, HSV and HSB. |
| **Gradients** | Linear, radial and conic gradients with draggable, keyboard-accessible stops, angle, shape, size and center controls, and HEX, RGB or HSL output. Copy the full `background` declaration or only the value. |
| **Palettes** | Complementary, analogous, triadic, split complementary, tetradic, monochromatic, shades and tints. Copy one color or the whole palette as a HEX list, CSS variables or JSON. |
| **Contrast** | WCAG 2.x contrast ratio with AA and AAA results for normal text, large text and UI components, plus a suggested foreground that reaches AA. |
| **Saved and recent** | Stored in `localStorage`. No account. |
| **Themes** | Light, dark and system, with keyboard navigation and visible focus throughout. |
| **PWA** | Installable and usable offline after the first load. |

## Screenshots

Add screenshots to this section after deploying.

## Tech stack

- [React 19](https://react.dev) and [Vite](https://vite.dev) with strict TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) with semantic design tokens in `src/index.css`
- [Lucide](https://lucide.dev) icons
- [Geist](https://vercel.com/font) and Geist Mono, self-hosted through Fontsource
- [Vitest](https://vitest.dev) for the color, gradient and search logic

There is no state-management or routing library: state is React state plus two small contexts, persistence is `localStorage`, and routing is a small History API router.

## Getting started

Requires Node.js 20.19+ or 22+.

```bash
git clone https://github.com/Itz-Murali/Color-Pallet.git
cd Color-Pallet
npm install
npm run dev
```

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check with `tsc -b`, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (`npm run test:watch` to watch) |

No environment variables or API keys are needed.

## Shareable URLs

State is written to the query string without adding history entries.

| Route | Example |
| --- | --- |
| Explorer | `/?hex=7C3AED` (8 digits include alpha: `hex=7C3AED80`) |
| Gradients | `/gradients?type=linear&angle=135&stops=7C3AED@0,06B6D4@100` |
| Gradients, short form | `/gradients?colors=7C3AED,06B6D4&angle=135` |
| Radial and conic | `/gradients?type=radial&shape=circle&extent=farthest-corner&x=50&y=50&stops=7C3AED@0,06B6D4@100` |
| Palettes | `/palettes?hex=7C3AED&type=analogous` |
| Contrast | `/contrast?fg=FFFFFF&bg=7C3AED` |

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `R` | Generate a random color (Explorer) |
| `/` | Focus the color search (Explorer) |
| Arrow keys | Move the picker or a gradient stop. Hold `Shift` for larger steps |

## Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel choose **Add New, Project** and import the repository.
3. Keep the detected settings: framework **Vite**, build command `npm run build`, output directory `dist`.
4. Deploy.

From the command line:

```bash
npm i -g vercel
vercel
vercel --prod
```

`vercel.json` includes the single-page-app rewrite, long-lived caching for hashed assets and basic security headers. Other hosts work as long as unknown paths are rewritten to `index.html`.

## Project structure

```text
src/
  components/    Shared UI: Button, Panel, ColorPicker, CopyButton, AppShell, Footer, BrandLogo
  features/
    color/       Explorer: search, picker, inspector, format converter, color context
    gradient/    Preview, type controls, stop editor, CSS output
    palette/     Palette controls and results
    contrast/    Contrast summary, checks and inputs
    library/     Saved and recent colors
  hooks/         useTheme, useCopy, useHotkey, useDocumentTitle
  lib/
    color/       Pure color logic: convert, parse, format, contrast, palette, random
    gradient.ts  Gradient model, CSS generation, URL serialization
    router.ts    History API router
  data/          named-colors.ts, site.ts
  pages/         One component per route
  types/         Shared types
  utils/         clipboard, storage, url, eyedropper, cn
public/          PWA manifest and service worker
```

## Architecture

- **Pure logic, thin UI.** Everything that computes lives in `src/lib` and is unit tested.
- **HSV is the source of truth for the selected color.** Storing HSVA keeps hue stable when saturation or brightness reaches zero. RGB, HSL and HEX are derived, and unrounded values are kept so editing one channel never nudges the others.
- **Forgiving input, strict output.** `parseColorInput` accepts HEX (3, 4, 6 and 8 digits), `rgb()`, `hsl()`, `hsv()`, `hsb()`, bare triplets and color names, and returns `null` instead of throwing.
- **Failure tolerant.** `localStorage` errors fall back to in-memory state, and copying falls back to a textarea outside secure contexts.
- **Offline.** `public/sw.js` precaches the build from the file list Vite writes to `asset-manifest.json`. It only registers in production.

## Privacy

There is no backend, database, analytics or tracking, and colors never leave your device. The only network requests besides the app itself are the logo and creator images, which load from the URLs in `src/data/site.ts`. Every tool keeps working if they fail to load.

## 👩‍💻 Creators

<table width="100%">
    <tr>
      <td align="center" width="50%">
        <img src="https://random-images-anya.vercel.app/anya" width="260"><br><br>
        <b>𝜜ɴყꫝㅤ𓆩💗𓆪</b><br><br>
        <a href="https://github.com/itz-Anya">
          <img src="https://img.shields.io/badge/GitHub-Itz--Anya-black?style=for-the-badge&logo=github">
        </a>
      </td>
      <td align="center" width="50%">
        <img src="https://itz-murali-images.vercel.app/api" width="260"><br><br>
        <b>𝐌 𝐔 𝐑 𝚨 𝐋 𝐈 𓂃ִֶָ⋆.˚</b><br><br>
        <a href="https://github.com/Itz-Murali">
          <img src="https://img.shields.io/badge/GitHub-Itz--Murali-black?style=for-the-badge&logo=github">
        </a>
      </td>
    </tr>
  </table>

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first. Keep it client-side, keep dependencies low, add tests for logic changes, and run `npm run lint && npm test && npm run build` before opening a pull request.

## License

Released under the [MIT License](LICENSE).
