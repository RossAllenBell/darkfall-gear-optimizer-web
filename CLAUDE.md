# Claude Development Guidelines

This document contains important guidelines and context for Claude when working on this project. These should be followed in every session to maintain consistency and quality.

## Testing Requirements

### Always Run Tests Before Completion
- **CRITICAL**: Always run all automated tests and verify they're passing before considering a feature complete
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

### Testing Checklist Before Feature Completion
- [ ] Unit tests written and passing
- [ ] Component tests written and passing
- [ ] E2E tests added for new user workflows (if applicable)
- [ ] All tests run successfully: `npm test`
- [ ] Coverage is adequate: `npm run test:coverage`
- [ ] Playwright MCP tests verify browser behavior (when applicable)
- [ ] Code committed with appropriate message
- [ ] Ready for user to push

## Project-Specific Context

### Architecture
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Pages (static site)
- **Data**: Pre-computed JSON files in `public/`

### Key Files
- `src/utils/gearCalculator.js` - Core business logic for finding optimal gear
- `src/hooks/useGearOptimizer.jsx` - Main state management hook
- `public/config.json` - Dataset configuration
- `vite.config.js` - Base path set to `/darkfall-gear-optimizer-web/` for GitHub Pages

### Development Server
```bash
npm run dev  # Runs on http://localhost:5173
```

### Build and Preview
```bash
npm run build    # Build for production
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
