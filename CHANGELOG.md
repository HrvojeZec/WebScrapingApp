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

### Changed

- The client and server now live in npm workspaces, `apps/web` and `apps/api`, with one lockfile
  at the repository root (#5)
- The codebase is formatted with Prettier, and all files use LF line endings (#8)
- The README describes the project and the ongoing refactor instead of scraper selector notes (#6)

### Removed

- The store suggestion form on the home page, which wrote to an unauthenticated endpoint (#13)

### Fixed

- Building the web app from the repository root no longer fails on Windows because of an unused
  inline style in `index.html` (#5)

### Security

- Removed unauthenticated endpoints: `DELETE /api/products/delete-products` (anyone could delete
  products, including all of them through a query operator in the body), `POST /api/storeData/add`,
  the unbounded `GET /api/products` and `GET /api/products/scrapeId`, which passed the query string
  to the database (#13)
- The internal scrape executor listens on 127.0.0.1 only and rejects a keyword that is not a
  non-empty string (#13)
- The Mall scraper checks the host of image URLs instead of their prefix (#13)

## [0.1.0] - 2026-11-24

Baseline tag before the refactor, on the code as of August 2025: the original thesis project with
Mall and Sancta Domenica scrapers, an Express and MongoDB API and a React client.

[Unreleased]: https://github.com/HrvojeZec/WebScrapingApp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/HrvojeZec/WebScrapingApp/releases/tag/v0.1.0
