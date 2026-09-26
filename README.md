# TaskFlow

A task management app built with React 19, TypeScript and Material UI 7. Tasks carry a
status, priority, due date, project and tags; you can search, filter, sort and get a
progress overview. Everything is stored locally in the browser.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Script                  | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Vite dev server with hot reload         |
| `npm run build`         | Type-check then build to `dist/`        |
| `npm run preview`       | Serve the production build              |
| `npm run typecheck`     | `tsc -b --noEmit`                       |
| `npm run lint`          | ESLint (flat config, typescript-eslint) |
| `npm run format`        | Prettier write                          |
| `npm run test`          | Vitest, single run                      |
| `npm run test:watch`    | Vitest, watch mode                      |
| `npm run test:coverage` | Vitest with a V8 coverage report        |
| `npm run verify`        | typecheck + lint + format check + tests |

Run `npm run verify` before pushing; it is the same gate CI should use.

## Features

- **Tasks** with title, notes, status (to do / in progress / done), priority
  (low to urgent), due date, project and tags.
- **Grouped by due date** into Overdue, Today, Tomorrow, This week, Later, No date and
  Completed, with sticky section headers. Picking a non-due sort falls back to a single
  flat list rather than pretending to be grouped.
- **A flat, dense list.** One row per task with hairline separators, a two-state
  completion circle, and secondary metadata in a single quiet line instead of a row of
  chips. Row actions stay out of the way until you hover or tab into them.
- **Progress summary**: a hairline bar plus clickable overdue and due-today counts.
  Clicking a count filters the list.
- **Search** across title, notes, project and tags.
- **Filters** for status, priority, due date, project and tags, combined with AND
  across facets and OR within a facet.
- **Sorting** by due date, priority, creation date or title.
- **Undo** on every deletion, including bulk "clear completed".
- **Light and dark themes**, following the system preference until you override it.
- **Keyboard shortcuts**: `N` for a new task, `/` to focus search, `Enter` to submit
  a single-line field.
- **Starts empty.** No seeded sample tasks, so your list is yours from the first run.
- **Responsive** down to small phones; row actions remain reachable without hover.

## Design language

The interface is deliberately quiet, and the rules are worth keeping if you extend it:

- **One accent colour.** Indigo, used for the logo, focus rings and the primary action.
  Nothing else competes with it.
- **No gradients, no decorative shadows.** Elevation is reserved for real overlays
  (dialogs, menus). Cards and rows are flat surfaces separated by hairlines.
- **Colour is information.** Red and amber are only ever applied to a task that is
  overdue or due today, and to high and urgent priority. Everything else is grey.
  Completed work never nags, even when it was finished after its deadline.
- **Typography does the hierarchy.** The task title is the largest text in the row;
  metadata is small and secondary. Headings use the self-hosted Poppins, while UI and
  body copy use the platform sans, which is denser and more legible at these sizes.

## Architecture

```
src/
  components/    presentational and interactive UI
  hooks/         small reusable hooks
  lib/           pure logic: dates, task helpers, storage
  store/         reducer, provider and store context
  styles/        self-hosted fonts and global CSS
  test/          test setup, factories and render helpers
  theme/         MUI theme tokens and component overrides
  types/         domain and filter types
```

A few decisions worth knowing about:

- **The reducer is pure.** It receives the timestamp and the new id in the action
  payload instead of calling `Date.now()` or generating ids, which keeps it
  deterministic and trivially testable. Persistence happens in an effect in
  `TaskProvider`.
- **Storage is versioned and defensive.** `lib/storage.ts` coerces whatever it finds
  in `localStorage` into valid tasks, discards corrupt entries, and transparently
  migrates data written by the previous version of this app (the old `todos` key
  with `details` / `Incomplete` fields) into the new `taskflow.tasks` schema.
  If `localStorage` is unavailable, the app keeps working in memory.
- **One context, not two.** The old app split state and dispatch across two contexts.
  A single `TaskStoreContext` with a memoised value gives you one hook and one
  provider.
- **Dates are local.** Due dates are stored as `YYYY-MM-DD` and parsed to local
  midnight, so a task never shifts a day because of the viewer's time zone.
- **Grouping is a sort, not a permanent layout.** `groupTasksByDue` only runs for the
  `due-asc` order; every other sort renders a flat list so the visible order always
  matches the sort the user picked.
- **Fonts are self-hosted** from `public/Font`, so headings do not depend on a
  third-party request. Body copy deliberately uses the platform stack rather than
  shipping a second webfont for text that mostly sits at 12–15px.

## Data model

```ts
interface Task {
  id: string;
  title: string;
  notes: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null; // YYYY-MM-DD
  project: string; // "Inbox" when unset
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
```

Tasks persist under the `taskflow.tasks` key; the colour scheme under
`taskflow.colorMode`.

## Testing

113 tests across 6 files: pure unit tests for dates, filtering, sorting, due-date
grouping, stats, storage and the reducer, plus integration tests that drive the real UI
through create, edit, completing, search, filtering, delete and undo.

```bash
npm run test:coverage
```

Note that the suite runs under jsdom, where Material UI dialogs and transitions are
slow; expect roughly 90 seconds for the full run.
