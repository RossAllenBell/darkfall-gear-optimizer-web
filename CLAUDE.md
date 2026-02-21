# Claude Development Guidelines

This document contains important guidelines and context for Claude when working on this project. These should be followed in every session to maintain consistency and quality.

## Testing Requirements

### Always Run Tests Before Completion
- **CRITICAL**: Always run all automated tests and verify they're passing before considering a feature complete
- **CRITICAL**: Any non-trivial change must include comprehensive automated test coverage — unit tests for new logic, component tests for new UI, and e2e tests for new user workflows
- Run `npm test` to execute the full test suite
- Run `npm run test:coverage` to check code coverage
- All tests must pass before committing code

### Testing Strategy
This project uses a multi-layered testing approach:

1. **Unit Tests** (Vitest)
   - Test utility functions in isolation
   - Located in `src/utils/__tests__/`
   - Fast and comprehensive coverage of business logic

2. **Component Tests** (Vitest + React Testing Library)
   - Test React components in isolation
   - Located in `src/components/__tests__/`
   - Focus on user interactions and component behavior

3. **End-to-End Tests** (Playwright MCP)
   - Test full user workflows in a real headless browser
   - Located in `e2e/`
   - **Use Playwright MCP for autonomous browser testing** - this allows Claude to interact with the running application in a real browser
   - Test critical user paths: dataset selection → feather configuration → encumbrance adjustment → results display
   - Verify responsive design on different viewport sizes

### Running Tests

```bash
# Run all unit and component tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run Playwright e2e tests
npm run test:e2e

# Run Playwright tests in UI mode (for debugging)
npm run test:e2e:ui
```

## Git Workflow

### Commit Strategy
- **Commit features and bug fixes as separate commits**
- Use clear, descriptive commit messages
- Each commit should represent a single logical change
- Format: `<type>: <description>`
  - Examples: `feat: add feather input component`, `fix: correct encumbrance calculation`

### Never Push to Origin
- **DO NOT push to origin/remote** - the user will do this manually
- Pushing triggers GitHub Actions deployment, which should be controlled
- After completing work, create commits locally but leave pushing to the user

### Example Workflow
```bash
# Make changes...
git add src/components/NewFeature.jsx
git commit -m "feat: add new feature component"

# Make another change...
git add src/utils/bugfix.js
git commit -m "fix: correct edge case in calculation"

# DO NOT run: git push origin main
# User will push manually when ready
```

## Playwright MCP Usage

### When to Use Playwright MCP
Use Playwright MCP for autonomous browser testing when:
- Implementing new user-facing features
- Fixing UI bugs that need visual verification
- Testing complex user interactions
- Verifying responsive design
- Testing data loading and async operations
- Need to verify the full integration works end-to-end

### How to Use Playwright MCP
Playwright MCP allows Claude to control a headless browser and interact with the application as a real user would. Use it to:
- Navigate to the local dev server (typically `http://localhost:5173`)
- Click buttons, fill forms, select dropdowns
- Verify elements appear correctly
- Test the complete user workflow
- Take screenshots for debugging

### E2E Test Locator Guidelines
- **CRITICAL**: All e2e tests (`npm test` and `npm run test:e2e`) must pass cleanly — zero failures
- **Never use `getByText()` for text that may appear as a substring elsewhere on the page.** Playwright's `getByText` uses substring matching, so `getByText('Enc')` matches "Encumbrance" and `getByText('Optimal Gear Configuration')` matches "Find optimal gear configurations..."
- **Prefer role-based locators**: `getByRole('heading', { name: '...' })`, `getByRole('columnheader', { name: '...' })`, `getByRole('cell', { name: '...' })`, etc.
- **Use aria-labels for buttons with ambiguous text**: The +/-0.1 buttons have `aria-label="Increase by 0.1"` / `aria-label="Decrease by 0.1"` — use `getByRole('button', { name: 'Increase by 0.1' })`, not `{ name: '+0.1' }`
- **Scope locators when multiple similar elements exist**: e.g. when feather is enabled, both FeatherInput and EncumbranceInput have +/-0.1 buttons

### Testing Checklist Before Feature Completion
- [ ] Unit tests written and passing
- [ ] Component tests written and passing
- [ ] E2E tests added for new user workflows (if applicable)
- [ ] All tests run successfully: `npm test`
- [ ] Coverage is adequate: `npm run test:coverage`
- [ ] Playwright MCP tests verify browser behavior (when applicable)
- [ ] Code committed with appropriate message
- [ ] Ready for user to push

## Codebase Overview

This is a React SPA that helps Darkfall players choose optimal armor combinations given a target encumbrance and protection profile. All optimization is pre-computed — the app queries static JSON files, there is no backend.

### Architecture
- **Framework**: React + Vite
- **Styling**: Tailwind CSS with custom `armor-*` color tokens (see `tailwind.config.js`)
- **State**: Single custom hook (`useGearOptimizer`), no router or state library. Props flow strictly downward.
- **Deployment**: GitHub Pages via `.github/workflows/deploy.yml` (Node 20, `npm ci` + `npm run build`, deploy `./dist`)
- **Base path**: `vite.config.js` sets `base: '/darkfall-gear-optimizer-web/'` — all fetch URLs in `useGearOptimizer.jsx` are hardcoded with this prefix. Both must change together.

### Data Flow

0. **URL initialization**: on first render, `parseUrlParams(window.location.search)` initializes `featherEnabled`, `featherValue`, `headArmorType`, and `targetEncumbrance` directly. `protection` and `tier` IDs are stored as pending refs (they need config to resolve).
1. **On mount** (`useGearOptimizer` Effect 1): fetches `config.json` (dropdown options) and `armor-data-complete.csv` (per-slot stats for display) in parallel. After config loads, resolves pending URL param IDs (`protection`/`tier`) against config and sets selections.
2. **On dataset selection** (Effect 2): when both protection type and armor tier are selected, fetches `results-complete-{tierId}-{protectionTypeId}.json`. Clamps `targetEncumbrance` to the new dataset's valid range.
3. **On feather config change** (Effect 3): recomputes encumbrance range and clamps `targetEncumbrance` if needed.
4. **URL sync** (Effect 4): after config loads, syncs all state to URL via `history.replaceState`. Omits default values to keep URLs clean.
5. **Each render**: derives `optimalGear` via `findOptimalGear()`, then `parseGearData()` → `calculateRealStats()` for the stats table.

### Key Files

| File | Purpose |
|---|---|
| `src/App.jsx` | Top-level layout. Single-column before dataset loads, two-column after. |
| `src/hooks/useGearOptimizer.jsx` | All application state and data fetching. Returns flat object of state + setters. |
| `src/utils/gearCalculator.js` | Pure business logic (6 functions + 1 constant). No side effects. |
| `src/utils/urlState.js` | URL state persistence: `parseUrlParams`, `serializeUrlParams`, `buildUrl`, `validateParamsAgainstConfig`. |
| `src/components/DatasetSelector.jsx` | Protection type dropdown from `config.protectionTypes`. |
| `src/components/ArmorAccessSelector.jsx` | Armor tier dropdown from `config.armorAccessTiers`. |
| `src/components/FeatherInput.jsx` | Feather toggle, value input (0.1–30) with Q1–Q5 presets, head armor type dropdown. |
| `src/components/EncumbranceInput.jsx` | Target encumbrance input with +/-0.1 buttons and 20/30/40 presets. |
| `src/components/ResultsDisplay.jsx` | Gear slot display + `ArmorStatsTable` (named export) for per-slot damage stats. |
| `public/config.json` | Protection types (6), armor access tiers (4), armor type names (13). |
| `public/armor-data-complete.csv` | 96 rows of per-type/per-slot stats (encumbrance + 13 damage types). |
| `public/results-complete-*.json` | 24 pre-computed dataset files (6 protection types × 4 tiers). |
| `tailwind.config.js` | Custom `armor-*` colors with safelist to prevent purging. |
| `vite.config.js` | Base path for GitHub Pages. |

### Business Logic (`gearCalculator.js`)

- **`findOptimalGear(results, targetEncumbrance, featherValue, headArmorType)`** — Core algorithm. If feather is active, adds `featherValue` to `targetEncumbrance` (feather reduces effective encumbrance, so gear can be heavier). Optionally filters by head armor type. Linear scan for highest `totalProtection` within budget. Data is pre-sorted by encumbrance.
- **`getEncumbranceRange(results, headArmorType, featherValue)`** — Returns `{min, max}` for the slider. Min is adjusted down by `featherValue`, clamped to 0. Max capped at 200.
- **`getAvailableEncumbrances(results, headArmorType)`** — Sorted deduplicated encumbrance values. Used for preset button availability.
- **`parseGearData(gearSet)`** — Parses gear piece descriptions into `{fixed: {head, chest, legs}, interchangeable: [{type, count}...]}`. Description patterns: `"Head - {type}"`, `"Chest - {type}"`, `"Legs - {type}"`, `"(interchangeable) - {type}"`.
- **`parseArmorCsv(csvText)`** — Parses CSV into lookup: `{ [armorType]: { [slot]: { encumbrance, stats } } }`.
- **`calculateRealStats(parsedGear, armorData)`** — Cross-references parsed gear with CSV data. Multiplies per-slot stats by count. Produces slot-level and total rows for `ArmorStatsTable`.
- **`DAMAGE_TYPES`** — 13 damage type names in CSV column order.

### Gear Model

- **10 armor slots total**: 3 fixed (Head, Chest, Legs) + 7 interchangeable.
- Interchangeable slots can mix armor types — this combinatorial space is why datasets are pre-computed offline.
- Each results JSON entry is **Pareto-optimal**: higher encumbrance always means higher `totalProtection`.
- `totalProtection` is a weighted scalar based on `metadata.protectionWeights`.
- The CSV is used **only for display** (the `ArmorStatsTable`). Protection scoring happens offline.

### State (`useGearOptimizer.jsx`)

Key state: `config`, `selectedProtectionType`, `selectedArmorTier`, `datasetResults`, `armorData`, `loading`, `error`, `featherEnabled`, `featherValue` (default 0.1), `headArmorType`, `targetEncumbrance` (default 20).

Derived each render: `optimalGear`, `encumbranceRange`, `realStats` (via `useMemo`).

**URL state**: All input state is persisted as URL query parameters via `history.replaceState` for shareable deeplinks. Params: `protection`, `tier`, `enc`, `feather`, `featherValue`, `headArmor`. Default values are omitted. `featherValue`/`headArmor` are only included when `feather=true`. On mount, URL params initialize state; `protection`/`tier` are resolved after config loads.

### Data File Schemas

**`config.json`**: `{ protectionTypes: [{id, displayName}], armorAccessTiers: [{id, displayName}], armorTypes: [string] }`

**Results JSON** (`results-complete-{tier}-{protection}.json`):
```json
{
  "metadata": { "availabilityTier": "common", "protectionWeights": {"Slashing": 1.0, ...} },
  "results": [
    {
      "rank": 1, "totalProtection": 0.0, "encumbrance": 0.0,
      "gear": {
        "piece1": { "description": "(interchangeable) - NoArmor", "count": 7, "encumbrance": 0.0, "protection": 0.0 },
        "piece2": { "description": "Head - NoArmor", "count": 1, ... },
        "piece3": { "description": "Legs - NoArmor", "count": 1, ... },
        "piece4": { "description": "Chest - NoArmor", "count": 1, ... }
      }
    }
  ]
}
```

### Development

```bash
npm run dev      # Dev server on http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build locally
```

## Code Quality Standards

### Before Committing
- Remove console.logs and debug code
- Ensure no linting errors
- Verify responsive design works
- Check that all edge cases are handled
- Update tests to cover new functionality

### Testing Edge Cases
Always consider and test:
- No dataset selected
- Feather mode enabled without head armor type selected
- Encumbrance values outside available range
- No results matching criteria
- Loading states
- Error states

## Keeping Documentation Current

After non-trivial changes (new features, architectural shifts, new data files, changed schemas, etc.), update this file and/or `README.md` to reflect the current state. The Codebase Overview above is only useful if it stays accurate.

## Session Continuity

This CLAUDE.md file serves as institutional memory across sessions. When starting a new session:
1. Read this file first to understand the project conventions
2. Review recent commits to understand what was done
3. Run tests to verify current state
4. Follow all guidelines in this document

## Questions?

If implementation details are unclear, check:
1. This CLAUDE.md file
2. README.md for user-facing documentation
3. Existing test files for examples
4. The implementation plan (if available in project history)
