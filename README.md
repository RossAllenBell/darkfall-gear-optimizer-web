# Darkfall Gear Optimizer Web App

A React-based single-page application for optimizing Darkfall gear configurations based on protection types and encumbrance targets.

## Features

- Select protection type (different damage weight combinations)
- Optional feathered head gear configuration
- Adjustable encumbrance targets with presets
- Real-time gear recommendations
- Mobile and desktop responsive design

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **GitHub Pages** - Static site hosting

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

### Testing

This project uses a comprehensive testing strategy:

```bash
# Run all unit and component tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run end-to-end tests with Playwright
npm run test:e2e

# Run e2e tests in UI mode (for debugging)
npm run test:e2e:ui

# Run all tests (unit + e2e)
npm run test:all
```

**Test Coverage:**
- **Unit Tests** (Vitest): Core business logic in `src/utils/`
- **Component Tests** (React Testing Library): Individual React components
- **E2E Tests** (Playwright): Full user workflows in real browser

**Known noise:** You may see `Error: .[0].local.default[0]: missing field 'description'` on stderr when running npm commands. This comes from the `dexter` Nix toolchain manager wrapping npm, not from the project or its tests. It can be safely ignored.

See `CLAUDE.md` for testing guidelines and development conventions.

## Deployment

The app automatically deploys to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions.

**GitHub Pages URL:** `https://<username>.github.io/darkfall-gear-optimizer-web/`

### Manual Setup for GitHub Pages

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to main branch to trigger deployment

## Project Structure

```
darkfall-gear-optimizer-web/
├── public/                     # Static assets
│   ├── config.json            # Dataset configuration
│   └── results-*.json         # Gear optimization data
├── src/
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Main app component
│   └── main.jsx               # React entry point
└── .github/workflows/         # GitHub Actions
```

## Usage

1. **Select Protection Type**: Choose the damage type weighting (e.g., 50% Fire/50% Slashing)
2. **Optional Feather Configuration**: Enable if you have feathered head gear
   - Enter feather value (0-200)
   - Select head armor type
3. **Set Target Encumbrance**: Use manual input, arrows, or presets
4. **View Results**: Optimal gear configuration displays automatically

## Data Format

The app uses JSON files with pre-computed gear optimization results. Each file contains:

- Metadata (dataset name, protection weights, timestamp)
- Results array (ranked gear configurations by encumbrance)

## License

MIT
