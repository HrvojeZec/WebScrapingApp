# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- MIT license, security policy, pull request template and this changelog (#6)
- Shared tooling at the repository root: one ESLint 9 and Prettier config, husky hooks with
  lint-staged and commitlint, and Node 26 and npm 11 pinned through `.nvmrc`, `engines` and
  `.npmrc` (#7)
- `.env.example` files for the API and the web app (#11)
- CI on GitHub Actions for pull requests and pushes to `develop` and `master`: lint, format,
  typecheck, unit tests and build, API integration tests against MongoDB 8.0.13, and an audit of
  production dependencies that fails on high or critical advisories. Pull request titles are
  validated as Conventional Commits, labels follow the branch name, and Dependabot opens weekly
  updates against `develop` (#14)
- Dependabot also skips major upgrades of `@vitejs/plugin-react`, `@eslint/js` and
  `slick-carousel`, which move together with Vite 8, ESLint 10 and the v0.3 carousel rework (#14)

### Changed

- The client and server now live in npm workspaces, `apps/web` and `apps/api`, with one lockfile
  at the repository root (#5)
- The codebase is formatted with Prettier, and all files use LF line endings (#8)
- The README describes the project and the ongoing refactor instead of scraper selector notes (#6)
- API tests run on Vitest, split into unit and integration projects, next to the code they test
  (#10)
- Puppeteer 25, mongodb-memory-server 11 with MongoDB 8.0.13 for tests (the version on Atlas) and
  rimraf 6; scrapers run headless (#15)
- The API uses ES module `import` and `export` throughout, `npm run lint` passes with no errors,
  and lint-staged runs ESLint on staged files (#12)

### Removed

- The old workflow, which ran on Node 18 against the removed `Server/` folder (#14)
- The store suggestion form on the home page, which wrote to an unauthenticated endpoint (#13)
- Unused or redundant packages: `fs`, `path`, `node-fetch`, `body-parser`, a direct `mongodb`,
  `@types/mocha` and `@tabler/icons` (#15)
- The scraper test that launched Chrome against hand-written HTML of a site that no longer exists;
  fixture-based parser tests replace it in v0.3.0 (#15)

### Fixed

- Building the web app from the repository root no longer fails on Windows because of an unused
  inline style in `index.html` (#5)
- The web build type-checks again (it used to run `tsc` without project references and hid 10
  type errors), the store filter uses Mantine 7's `renderOption`, and the Inter font loads instead
  of falling back to a system font (#9)
- API errors such as "no products found" return their status code (404, 400) instead of 500, and
  the store and product test suites run again (#10)
- The API reads its configuration from the environment and validates it at startup: the database
  URI, CORS origin and ports are no longer hardcoded, it exits with a list of missing or invalid
  variables, and it connects to the database before it accepts requests. The web app reads the
  API URL from `VITE_API_URL` (#11)
- The web app builds on case-sensitive file systems such as Linux: five stylesheets imported
  `Variables.module.scss`, but the file is `variables.module.scss` (#14)

### Security

- Removed unauthenticated endpoints: `DELETE /api/products/delete-products` (anyone could delete
  products, including all of them through a query operator in the body), `POST /api/storeData/add`,
  the unbounded `GET /api/products` and `GET /api/products/scrapeId`, which passed the query string
  to the database (#13)
- The internal scrape executor listens on 127.0.0.1 only, and both it and `POST /api/scrape`
  reject a keyword that is not a non-empty string (#13)
- The Mall scraper accepts image URLs only on the `https://www.mall.hr` origin instead of
  checking their prefix (#13)
- Patched dependencies: `npm audit` goes from 18 advisories (11 high) to 6 (1 high). Express,
  Mongoose and Axios start at patched versions. The remaining high advisory is in the Vite 5 dev
  server, which now listens on localhost only; the Vite 8 and React Router 7 upgrades follow in
  #25 (#15)

## [0.1.0] - 2026-11-24

Baseline tag before the refactor, on the code as of August 2025: the original thesis project with
Mall and Sancta Domenica scrapers, an Express and MongoDB API and a React client.

[Unreleased]: https://github.com/HrvojeZec/WebScrapingApp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/HrvojeZec/WebScrapingApp/releases/tag/v0.1.0
