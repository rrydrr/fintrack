# FinTrack

<div align="center">

**Modern, type-safe personal finance and asset tracking dashboard.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Elysia Eden](https://img.shields.io/badge/Elysia-Eden_Treaty-f97316?style=flat&logo=elysia)](https://elysiajs.com/eden/overview.html)
[![Backend Repository](https://img.shields.io/badge/Backend-fintrack--be-emerald?style=flat&logo=github)](https://github.com/rrydrr/fintrack-be)
[![Bun](https://img.shields.io/badge/Bun-1.3-fbf0df?style=flat&logo=bun)](https://bun.sh/)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm_Noncommercial-blue)](./LICENSE)

[Features](#-key-features) •
[Tech Stack](#-tech-stack) •
[Architecture](#-project-structure) •
[Getting Started](#-getting-started) •
[Environment Variables](#-environment-variables) •
[License](#-license) •
[Backend Repo ↗](https://github.com/rrydrr/fintrack-be)

</div>

---

## 🌟 Overview

**FinTrack** is a personal finance web dashboard created as a hobby project for fun and learning. It tracks wealth, assets, and liabilities with real-time currency conversion and account summaries. Built with the Next.js App Router and React 19, it pairs seamlessly with the [**FinTrack Backend (`fintrack-be`)**](https://github.com/rrydrr/fintrack-be) (powered by Elysia.js) using **Eden Treaty** for end-to-end type safety from server routes to client components.

---

## 🚀 Key Features

- **Role-Based Experience**:
  - **User Dashboard**: Real-time Net Worth calculation, total assets vs. liabilities breakdown, account overview, and quick currency-aware metrics.
  - **Admin Dashboard**: System currency configuration, platform overview, and invite code management (create, copy, revoke, track usage).
- **End-to-End Type Safety**:
  - Direct type inference from backend route definitions via `@elysiajs/eden`.
  - Zero manual API typing or code-generation steps required during active local development with [fintrack-be](https://github.com/rrydrr/fintrack-be).
- **Resilient CI/CD & Deployments**:
  - Automated backend symlink/junction setup (`setup:backend`).
  - Standalone fallback client (`lib/backend-fallback.ts`) ensuring zero-error builds on Vercel or CI environments where the backend repo is not co-located.
- **Robust Authentication & Routing**:
  - Cookie-based session management (`accessToken`, `refreshToken`) with silent token refresh on expiration.
  - Route authorization guards via edge proxy handler (`proxy.ts`).
- **Clean Modern Design**:
  - Dark/light responsive interface styled with Tailwind CSS v4 and Phosphor Icons.
  - Reusable card structures, status indicators, and currency formatting helpers.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Runtime & Package Manager** | [Bun](https://bun.sh/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons** | [Phosphor Icons](https://phosphoricons.com/) (`@phosphor-icons/react`) |
| **API Client** | [Eden Treaty](https://elysiajs.com/eden/treaty/overview.html) (`@elysiajs/eden`) |
| **Backend API** | [FinTrack Backend (`fintrack-be`)](https://github.com/rrydrr/fintrack-be) (Elysia.js) |

---

## 📁 Project Structure

```text
fintrack/
├── src/
│   ├── app/
│   │   ├── (auth)/         # Authentication routes (e.g. /login)
│   │   ├── (main)/         # Protected application pages (overview dashboard)
│   │   ├── globals.css     # Global styling & Tailwind directives
│   │   └── layout.tsx      # Root HTML structure and font setup
│   ├── components/
│   │   ├── partials/       # Layout partials (Navbar, Footer, Admin & User Overviews)
│   │   ├── reusables/      # Shared atomic components (Card, basicInputs, inputGroup)
│   │   └── providers.tsx   # Root context providers (AuthProvider)
│   ├── lib/
│   │   ├── api.ts          # Eden Treaty API client instantiation
│   │   ├── backend-fallback.ts # Fallback client used for standalone CI/Vercel builds
│   │   ├── formatting/     # Number and currency formatting utilities
│   │   └── hooks/          # Custom hooks (useAuth session management)
│   └── proxy.ts            # Route protection & auth redirection handler
├── public/                 # Static assets (favicons, SVG logos)
├── scripts/
│   └── setup-backend.ts    # Links backend types (symlink/junction) for development
├── .env.example            # Environment variable template
├── LICENSE                 # PolyForm Noncommercial 1.0.0 License
├── package.json
└── tsconfig.json
```

---

## 🚦 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.3 or higher recommended)
- Node.js 20+ (if not running solely through Bun)
- FinTrack Backend service running from [fintrack-be](https://github.com/rrydrr/fintrack-be) (default: `http://localhost:3001`)

### 1. Clone the repositories

Keep the backend and frontend in sibling directories or configure `BACKEND_PATH` accordingly:

```bash
# Clone backend
git clone https://github.com/rrydrr/fintrack-be.git

# Clone frontend
git clone https://github.com/rrydrr/fintrack.git
cd fintrack
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and adjust to match your local setup:

```bash
cp .env.example .env.local
```

### 4. Run the development server

```bash
bun dev
```

> **Note**: `bun dev` automatically runs `bun run setup:backend` beforehand (`predev` hook), establishing a symlink / NTFS junction to your [fintrack-be](https://github.com/rrydrr/fintrack-be) folder to enable full TypeScript typing for API calls.

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create `.env.local` in the root directory:

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API server | `http://localhost:3001` |
| `BACKEND_PATH` | Path to the local [fintrack-be](https://github.com/rrydrr/fintrack-be) repository | `../../elysia/fintrack-be` |

### Platform Path Examples:

- **Windows**: `../../elysia/fintrack-be` or `C:/Projects/fintrack-be`
- **Linux / macOS**: `../../elysia/fintrack-be` or `~/projects/fintrack-be`

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `bun dev` | Runs the development server with automatic backend linking (`predev`) |
| `bun run setup:backend` | Manually establishes the symlink / junction to the backend directory |
| `bun run build` | Builds the Next.js production bundle with backend type verification |
| `bun run start` | Starts the production server |
| `bun run lint` | Runs ESLint across the codebase |

---

## 🔗 Backend Type Linking

FinTrack uses `@backend/client` path aliases mapped via `tsconfig.json`. During local development, `scripts/setup-backend.ts` links your local clone of [fintrack-be](https://github.com/rrydrr/fintrack-be) into `./backend`, giving you real-time autocompletion and type-checking against backend routes.

When deploying to environments where the backend directory is unavailable (such as Vercel preview or production builds), the setup script automatically detects this and falls back to `./src/lib/backend-fallback.ts`, ensuring that compilation succeeds without configuration changes.

---

## 🌐 Related Repositories

- **Backend API**: [rrydrr/fintrack-be](https://github.com/rrydrr/fintrack-be) — Elysia.js backend API with Drizzle ORM, PostgreSQL, and Eden Treaty support.

---

## 📄 License

This project is licensed under the [**PolyForm Noncommercial License 1.0.0**](https://polyformproject.org/licenses/noncommercial/1.0.0).

- **Permitted Use**: Anyone is free to view, fork, run, and modify this software for **personal study, private entertainment, hobby projects, experimentation, and educational purposes**.
- **Commercial Restriction**: Commercial use, monetized distribution, or integration into commercial services is strictly prohibited without explicit written permission from the copyright holder.

For full license details, see the [LICENSE](./LICENSE) file.
