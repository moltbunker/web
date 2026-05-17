# Changelog

All notable changes to the Moltbunker web frontend are documented here.
This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `SECURITY.md` describing the vulnerability disclosure process for the web frontend and its Cloudflare Workers / Pages Functions code.
- `.github/PULL_REQUEST_TEMPLATE.md` with summary / linked tickets / change list / test plan / risk sections.
- `.github/workflows/check.yml` running `npm ci`, `npm run lint`, and `npm run build` on every PR and push to `main`.
- `.githooks/commit-msg` enforcing the project's commit-subject format; activated via `core.hooksPath` on a per-clone basis.

### Changed

- Blog feature additions and refinements (BLG-01 through BLG-03).
- Footer-rendering fixes (FIX-05).

### Security

- No code-side security changes yet on this project; see `moltbunker` repo CHANGELOG for the daemon-side and SDK-side security work that landed in parallel.

[Unreleased]: https://github.com/moltbunker/web/compare/HEAD~1...HEAD
