# Horse-Hippology-App

A React + TypeScript app for keeping track of horses and their owners.

## Getting started

```bash
pnpm install
pnpm dev        # start the dev server
pnpm test       # run tests
pnpm typecheck  # check types
pnpm build      # production build
```

## `HorseOwnerRegistry` component

`src/components/HorseOwnerRegistry.tsx` lets you:

- Add, edit and delete **owners** (name, phone, email)
- Add, edit and delete **horses** (name, breed, age, color, owner)
- Filter horses by owner, or show unassigned horses
- Types for `Owner` and `Horse` live in `src/types/registry.ts`
- Keep data across reloads (saved in the browser's `localStorage`)

Deleting an owner keeps their horses and marks them as unassigned.

```tsx
import HorseOwnerRegistry from './components/HorseOwnerRegistry.tsx';

<HorseOwnerRegistry storageKey="hippology" />
```
