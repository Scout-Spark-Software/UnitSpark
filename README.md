# Unit Spark

The adventures platform by Unit Spark, showcasing comprehensive solutions for scouting adventures including hiking and camping.

## About

Unit Spark is the parent company behind the adventures-focused website, adventures.unitspark.org. While Unit Spark focuses on outdoor adventure resources and inspiration for scouting activities, Unit Spark also develops a separate unit management platform (currently under development). The site features interactive sections highlighting hiking and camping adventures.

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) v2
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Runtime**: Node.js

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm, pnpm, or yarn

### Installation

```sh
npm install
```

### Development

Start the development server:

```sh
npm run dev
```

Open your browser and navigate to the local development URL (typically `http://localhost:5173`).

To automatically open the app in a browser:

```sh
npm run dev -- --open
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run check` - Run Svelte type checking
- `npm run check:watch` - Run type checking in watch mode

## Project Structure

```
src/
├── lib/
│   └── components/
│       ├── Navigation.svelte
│       ├── Hero.svelte
│       ├── AdventuresSection.svelte
│       ├── UnitManagementSection.svelte
│       ├── HikingSection.svelte
│       ├── CampingSection.svelte
│       └── Footer.svelte
├── routes/
│   ├── +page.svelte
│   └── +layout.svelte
└── app.d.ts
```

## Building for Production

Create an optimized production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Deployment

This project uses `@sveltejs/adapter-auto` which automatically selects the appropriate adapter for your deployment target. You may need to install a specific [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Contributing

This project is part of the Scout Spark Software initiative. For questions or contributions, please refer to the project maintainers.

## License

Private - All rights reserved
