# Apollo Conecta Facil

A React web app that lets you enter any company URL and instantly find key decision-makers with their verified contact data, powered by the Apollo.io API.

## What it does

Paste a company website URL — the app queries Apollo.io and returns a list of contacts at that company with names, roles, emails, and LinkedIn profiles. Results are displayed in a searchable table and can be exported.

## Stack

- **Framework:** TanStack Start (React 19 + TanStack Router + TanStack Query)
- **UI:** Radix UI primitives + Tailwind CSS v4
- **Language:** TypeScript
- **Bundler:** Vite + Bun

## Getting started

### Prerequisites
- [Bun](https://bun.sh) installed
- An Apollo.io API key

### Install and run

```bash
bun install
bun dev
```

### Environment variables

```env
APOLLO_API_KEY=your_apollo_api_key
```

## Project structure

```
src/
├── routes/          # TanStack Router file-based routes
├── components/      # SearchForm, ResultsTable, SummaryCard, ExportButton
├── hooks/           # useApolloSearch — query logic and state
├── types/           # Shared TypeScript types
└── lib/             # Utilities
```

## Features

- Company URL to decision-maker lookup via Apollo.io
- Live loading state with progress feedback
- Results table with contact details
- CSV export
- Fully typed with TypeScript
