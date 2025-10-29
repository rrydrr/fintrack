# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

FinTrack is a Nuxt 4 application using Vue 3 with TypeScript support. The project uses npm as the package manager and follows Nuxt's conventional directory structure.

## Development Commands

### Setup
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Starts development server at `http://localhost:3000`

### Build & Preview
```bash
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run generate   # Generate static site
```

### Code Quality
```bash
npx eslint .       # Run ESLint for linting
```

## Architecture

### Framework & Structure
- **Framework**: Nuxt 4 (Vue 3 + TypeScript)
- **Modules**: 
  - `@nuxt/eslint` - ESLint integration
  - `@nuxt/fonts` - Font optimization
- **Build System**: Nuxt's built-in Vite-based bundler

### Directory Organization
- `app/` - Main application code
  - `app.vue` - Root component with NuxtRouteAnnouncer and NuxtWelcome
- `public/` - Static assets (favicon, robots.txt)
- `.nuxt/` - Auto-generated Nuxt files (do not edit)
- `node_modules/` - Dependencies

### TypeScript Configuration
The project uses Nuxt's automatic TypeScript configuration. The root `tsconfig.json` references auto-generated configs in `.nuxt/` for:
- `tsconfig.app.json` - App code
- `tsconfig.server.json` - Server code  
- `tsconfig.shared.json` - Shared types
- `tsconfig.node.json` - Node environment

### ESLint Configuration
ESLint is configured via `eslint.config.mjs`, which imports Nuxt's auto-generated configuration from `.nuxt/eslint.config.mjs`.

## Nuxt Conventions

### File-based Routing
When adding pages, create `.vue` files in `app/pages/` directory. Nuxt auto-generates routes based on file structure.

### Auto Imports
Nuxt auto-imports:
- Vue composables (`ref`, `computed`, etc.)
- Nuxt composables (`useRoute`, `useState`, `useFetch`, etc.)
- Components from `components/` directory
- Utils from `composables/` and `utils/` directories

### Component Organization
- Place reusable components in `app/components/`
- Nested folders create namespaced components (e.g., `components/base/Button.vue` → `<BaseButton>`)

### State Management
Use Nuxt's built-in `useState` composable for shared state rather than external state management libraries.

### API Routes
Create API endpoints in `server/api/` directory. Files automatically become API routes.

## Development Notes

- The project uses Nuxt devtools (enabled in config)
- Compatibility date is set to `2025-07-15`
- All `.nuxt/` generated files should be ignored and never manually edited
- The project is configured as an ES module (`"type": "module"` in package.json)
