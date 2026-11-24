# StoreSeeker

StoreSeeker compares prices of electronics in Croatian online shops, keeps a price history for
each product and lets you know when a price drops.

> **Status: under active refactor towards v1.0.0.** The code in this repository is the original
> thesis version, now being rebuilt step by step. Progress is tracked in the
> [milestones](https://github.com/HrvojeZec/WebScrapingApp/milestones) and in
> [CHANGELOG.md](CHANGELOG.md).

## Roadmap

| Milestone                       | Scope                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| v0.2.0 Foundations              | npm workspaces, shared tooling, CI, passing tests, repository meta files                 |
| v0.3.0 Scraping core and search | Shop adapters tested against saved pages, price history, search with filters, new design |
| v0.4.0 Accounts and wishlist    | Email and Google sign-in, wishlist                                                       |
| v0.5.0 Price alerts             | Scheduled price checks with in-app, email and Web Push notifications                     |
| v1.0.0 Release                  | End-to-end tests, Docker, README with screenshots                                        |

The scraper is being rebuilt to identify itself honestly, respect each shop's `robots.txt` and
keep to strict rate limits.

## Stack

- **Web** (`apps/web`): React, TypeScript, Vite, Mantine
- **API** (`apps/api`): Node.js, Express, TypeScript, Mongoose, MongoDB
- **Shared** (`packages/shared`): zod schemas, DTO types and limits used by both apps
- **Scraping**: Puppeteer today; HTTP with HTML parsing and a browser fallback from v0.3.0
- **Repository**: npm workspaces with one lockfile at the root

## Running locally

Requirements: Node.js 26 and npm 11.

```bash
npm install
npm run dev:api   # API on http://localhost:5000
npm run dev:web   # web app on http://localhost:5173
```

The API needs a MongoDB connection. Configuration through a documented `.env.example` arrives in
v0.2.0 ([#11](https://github.com/HrvojeZec/WebScrapingApp/issues/11)).

## License

[MIT](LICENSE)
