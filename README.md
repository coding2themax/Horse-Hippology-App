# Horse-Hippology-App

A React app for keeping track of horses and their owners.

## Getting started

```bash
npm install
npm run dev     # start the dev server
npm test        # run tests
npm run build   # production build
```

## `HorseOwnerRegistry` component

`src/components/HorseOwnerRegistry.jsx` lets you:

- Add, edit and delete **owners** (name, phone, email)
- Add, edit and delete **horses** (name, breed, age, color, owner)
- Filter horses by owner, or show unassigned horses
- Keep data across reloads (saved in the browser's `localStorage`)

Deleting an owner keeps their horses and marks them as unassigned.

```jsx
import HorseOwnerRegistry from './components/HorseOwnerRegistry.jsx';

<HorseOwnerRegistry storageKey="hippology" />
```
