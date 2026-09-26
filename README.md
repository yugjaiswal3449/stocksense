# StockSense

StockSense is a polished inventory and warehouse operations dashboard built for real workflow demonstrations. It runs immediately in a fully persistent Demo Mode and is structured for a later Supabase connection.

## Highlights

- Persistent local demo workspace with 30 products, 6 categories, 3 warehouses, 11 locations, 46 operations, stock movements, and notifications
- Product catalog with search, category/status filters, sorting, pagination, CSV export, CRUD, unique SKUs, and product detail history
- Receipt, delivery, internal transfer, and adjustment workflows with Draft → Waiting → Ready → Done states
- Centralized inventory engine that prevents duplicate validation and negative inventory
- Immutable-style ledger, movement timeline, warehouse/location management, analytics, notifications, global Cmd/Ctrl+K search, light/dark themes, data import/export/reset, and responsive mobile navigation
- GitHub Pages-safe `HashRouter` and relative Vite asset paths
- Supabase client bootstrap that stays disabled until environment variables are present

## Tech stack

React 19, TypeScript, Vite, React Router, Recharts, React Hook Form, Zod, Lucide, Supabase JS, Vitest, React Testing Library, ESLint, and Prettier.

## Run locally

```bash
git clone https://github.com/YOUR_USERNAME/stocksense.git
cd stocksense
npm install
npm run dev
```

Open the local URL printed by Vite, normally [http://localhost:5173](http://localhost:5173).

Demo credentials:

```text
admin@stocksense.demo
demo123
```

You can also choose **Continue as Demo User**.

## Quality checks

```bash
npm run lint
npm run test
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Repository structure

```text
src/
  data/          realistic seed data
  services/      inventory rules and Supabase bootstrap
  stores/        persistence and application actions
  test/          test environment setup
  types/         domain models
  App.tsx        routes and product surfaces
  styles.css     responsive visual system
.github/workflows/deploy.yml
docs/screenshots/
```

## Create and push your GitHub repository

Create an empty repository named `stocksense` on GitHub, then run:

```bash
git init
git add .
git commit -m "feat: build StockSense inventory dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stocksense.git
git push -u origin main
```

## GitHub Pages deployment

1. Push the repository to GitHub.
2. Open **Settings → Pages** in the GitHub repository.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Push to `main`, or run **Deploy StockSense to GitHub Pages** manually from the Actions tab.
5. The workflow installs locked dependencies, runs lint and tests, creates a production build, then deploys `dist/`.

The app uses `HashRouter` and `base: './'`, so direct navigation and refreshes work reliably under a repository subpath such as `https://YOUR_USERNAME.github.io/stocksense/`.

## Supabase mode

Copy the environment template:

```bash
cp .env.example .env.local
```

Set:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

The client bootstrap lives in `src/services/supabase.ts`. The current release intentionally keeps the production data repository in Demo Mode until project-specific Supabase tables and Row Level Security policies are configured. Recommended tables mirror the domain interfaces: `users`, `products`, `categories`, `warehouses`, `locations`, `inventory`, `operations`, `operation_lines`, `stock_movements`, and `notifications`. Never commit a service-role key.

## Inventory rules covered by tests

- Receipt +50 increases destination stock by 50
- Delivery −10 decreases source stock by 10
- Transfer −20/+20 preserves total company inventory
- Adjustment 100 → 97 sets the final quantity and records −3
- An operation cannot be validated twice
- Delivery cannot exceed available stock
- Cancelled operations cannot affect inventory

## Screenshots

Place project screenshots in `docs/screenshots/` as documented in that directory. Suggested views: Dashboard, Products, Receipts, Transfers, Ledger, Analytics, and Mobile.

## Known limitations

- Demo authentication is intentionally local and suitable for demonstrations, not production security.
- Supabase connectivity is prepared but requires a project-specific schema, Row Level Security policies, and repository adapter before enabling cloud writes.
- Demo data is stored per browser/device, so it is not shared between users.

## License

MIT
