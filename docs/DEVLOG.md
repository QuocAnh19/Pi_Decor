# Nhật Ký Phát Triển Pi Decor (DEVLOG.md)

> Khung nhật ký phát triển được sinh tự động từ lịch sử commit Git thông qua script `node scripts/gen-devlog.mjs`.
> Mỗi ngày bao gồm danh sách các commit thực tế kèm mục trống để chủ dự án bổ sung lý do nghiệp vụ, thách thức và quyết định.

## Mục Lục Ngày Phát Triển

- [2026-10-18](#20261018) — 6 commit(s)
- [2026-10-17](#20261017) — 23 commit(s)
- [2026-10-16](#20261016) — 39 commit(s)
- [2026-10-15](#20261015) — 3 commit(s)
- [2026-10-13](#20261013) — 1 commit(s)
- [2026-10-12](#20261012) — 14 commit(s)
- [2026-09-02](#20260902) — 20 commit(s)
- [2026-08-24](#20260824) — 9 commit(s)
- [2026-08-15](#20260815) — 4 commit(s)
- [2026-08-14](#20260814) — 2 commit(s)
- [2026-08-08](#20260808) — 1 commit(s)
- [2026-08-07](#20260807) — 3 commit(s)

---

### <a id="20261018"></a>2026-10-18

#### Danh sách commit

- [`14ee57a`](https://github.com/QuocAnh19/Pi_Decor/commit/14ee57a) — docs(data): generated data dictionary, ERD and column comments
- [`5f88f36`](https://github.com/QuocAnh19/Pi_Decor/commit/5f88f36) — docs(features): admin feature specifications and traceability matrix
- [`7a845a0`](https://github.com/QuocAnh19/Pi_Decor/commit/7a845a0) — docs(features): public feature specifications
- [`ec3b22d`](https://github.com/QuocAnh19/Pi_Decor/commit/ec3b22d) — docs(product): PRD, roles matrix, user stories and glossary
- [`9051e59`](https://github.com/QuocAnh19/Pi_Decor/commit/9051e59) — chore(repo): PR/issue templates, CODEOWNERS, SECURITY, CHANGELOG and release workflow
- [`d9a42fb`](https://github.com/QuocAnh19/Pi_Decor/commit/d9a42fb) — docs(legal): LICENSE, NOTICE, third-party license and asset inventory

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20261017"></a>2026-10-17

#### Danh sách commit

- [`9eb00cc`](https://github.com/QuocAnh19/Pi_Decor/commit/9eb00cc) — test(e2e): add studio template seed and linux baseline snapshots for ci
- [`409a3cd`](https://github.com/QuocAnh19/Pi_Decor/commit/409a3cd) — fix(ci): remove db\_ssl env override in test jobs to preserve host-based ssl resolution
- [`ffb3341`](https://github.com/QuocAnh19/Pi_Decor/commit/ffb3341) — fix(ci): harden docker image against cve, fix service connection strings, and update domain constraints
- [`5a6427e`](https://github.com/QuocAnh19/Pi_Decor/commit/5a6427e) — fix(ci): update ssl test defaults, ci connection strings, and alpine security updates
- [`2567288`](https://github.com/QuocAnh19/Pi_Decor/commit/2567288) — ci: image smoke test, security scans, SBOM, least-privilege workflows, pg SSL mode fix
- [`12054b3`](https://github.com/QuocAnh19/Pi_Decor/commit/12054b3) — refactor(styles): decompose scss files over 300 lines into partials
- [`f948b93`](https://github.com/QuocAnh19/Pi_Decor/commit/f948b93) — refactor(styles): extract shared mixins and placeholders to reduce scss duplication
- [`c7ecdfc`](https://github.com/QuocAnh19/Pi_Decor/commit/c7ecdfc) — refactor(styles): standardize color tokens and enforce zero hex in scss
- [`59414c2`](https://github.com/QuocAnh19/Pi_Decor/commit/59414c2) — test: coverage reporting, studio logic tests, Playwright e2e and visual baselines
- [`57c428d`](https://github.com/QuocAnh19/Pi_Decor/commit/57c428d) — refactor(web): split TextAssetCustomizer into smaller modules
- [`8b3ffaf`](https://github.com/QuocAnh19/Pi_Decor/commit/8b3ffaf) — refactor(web): split SaveDesignModal into smaller modules
- [`0d065b3`](https://github.com/QuocAnh19/Pi_Decor/commit/0d065b3) — refactor(api): split seed.js into smaller modules
- [`da4239d`](https://github.com/QuocAnh19/Pi_Decor/commit/da4239d) — refactor(api): split database.pg.js into smaller modules
- [`a80dc79`](https://github.com/QuocAnh19/Pi_Decor/commit/a80dc79) — feat: business config from env, privacy page wiring and launch readiness gate
- [`907dd41`](https://github.com/QuocAnh19/Pi_Decor/commit/907dd41) — feat(leads): activity timeline tab in lead drawer
- [`e9d50f4`](https://github.com/QuocAnh19/Pi_Decor/commit/e9d50f4) — feat(admin): services management page
- [`3537539`](https://github.com/QuocAnh19/Pi_Decor/commit/3537539) — refactor(api): remove unused granular studio endpoints
- [`fb0d855`](https://github.com/QuocAnh19/Pi_Decor/commit/fb0d855) — chore(db): drop unused designs, media\_assets and orphan views
- [`4a641fd`](https://github.com/QuocAnh19/Pi_Decor/commit/4a641fd) — chore(db): squash 29 migrations into verified baseline
- [`f06ea75`](https://github.com/QuocAnh19/Pi_Decor/commit/f06ea75) — feat(infra): Neon pooled/direct connections, resilient pool, split health checks, Cloudinary prefix and media audit
- [`80e575d`](https://github.com/QuocAnh19/Pi_Decor/commit/80e575d) — feat(auth): add admin schemas, password policy, uuid param validation, and integration tests
- [`30af6a0`](https://github.com/QuocAnh19/Pi_Decor/commit/30af6a0) — fix(deps): patch vulnerable dependencies and document audit decisions
- [`af9d7d4`](https://github.com/QuocAnh19/Pi_Decor/commit/af9d7d4) — chore: monorepo-aware AGENTS.md and single verify script

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20261016"></a>2026-10-16

#### Danh sách commit

- [`b866864`](https://github.com/QuocAnh19/Pi_Decor/commit/b866864) — refactor(api): modularize studio
- [`21b227a`](https://github.com/QuocAnh19/Pi_Decor/commit/21b227a) — refactor(api): modularize testimonials
- [`d734815`](https://github.com/QuocAnh19/Pi_Decor/commit/d734815) — refactor(api): modularize services
- [`8162723`](https://github.com/QuocAnh19/Pi_Decor/commit/8162723) — refactor(api): modularize materials
- [`3b8f712`](https://github.com/QuocAnh19/Pi_Decor/commit/3b8f712) — refactor(api): modularize venues
- [`1fde843`](https://github.com/QuocAnh19/Pi_Decor/commit/1fde843) — refactor(api): modularize projects
- [`fbd11af`](https://github.com/QuocAnh19/Pi_Decor/commit/fbd11af) — refactor(api): modularize quotations
- [`805bf67`](https://github.com/QuocAnh19/Pi_Decor/commit/805bf67) — refactor(api): modularize auth
- [`ca23afe`](https://github.com/QuocAnh19/Pi_Decor/commit/ca23afe) — refactor(api): modularize leads
- [`18a10dc`](https://github.com/QuocAnh19/Pi_Decor/commit/18a10dc) — refactor: shared zod schemas and DTO types package
- [`7f5af4d`](https://github.com/QuocAnh19/Pi_Decor/commit/7f5af4d) — chore: convert to npm workspaces monorepo (apps/web, apps/api)
- [`6ada129`](https://github.com/QuocAnh19/Pi_Decor/commit/6ada129) — docs: add README, architecture, API reference, runbook and contributing guide
- [`b18a5ac`](https://github.com/QuocAnh19/Pi_Decor/commit/b18a5ac) — feat: Sentry hooks, SEO metadata, consent capture and privacy policy draft
- [`1906300`](https://github.com/QuocAnh19/Pi_Decor/commit/1906300) — ci: add GitHub Actions, Dockerfile, SPA fallback config, prettier and husky
- [`cdc0578`](https://github.com/QuocAnh19/Pi_Decor/commit/cdc0578) — test: add server integration tests and client unit tests
- [`ec86208`](https://github.com/QuocAnh19/Pi_Decor/commit/ec86208) — perf(client): route-level code splitting, optimized images/icons, self-hosted fonts
- [`052c414`](https://github.com/QuocAnh19/Pi_Decor/commit/052c414) — refactor(styles): single source design tokens via CSS variables
- [`96cbb4b`](https://github.com/QuocAnh19/Pi_Decor/commit/96cbb4b) — refactor(lib): split api into smaller modules
- [`99d4076`](https://github.com/QuocAnh19/Pi_Decor/commit/99d4076) — refactor(lib): split types into smaller modules
- [`ed1ec2d`](https://github.com/QuocAnh19/Pi_Decor/commit/ed1ec2d) — refactor(studio): split seed templates into smaller modules
- [`a0b766a`](https://github.com/QuocAnh19/Pi_Decor/commit/a0b766a) — refactor(studio): split MaterialPickerForSlot into smaller modules
- [`68b405e`](https://github.com/QuocAnh19/Pi_Decor/commit/68b405e) — refactor(studio): split SlotList into smaller modules
- [`df057e3`](https://github.com/QuocAnh19/Pi_Decor/commit/df057e3) — refactor(studio): split SaveDesignModal into smaller modules
- [`5be9180`](https://github.com/QuocAnh19/Pi_Decor/commit/5be9180) — refactor(studio): split EditorHeader into smaller modules
- [`5003e8a`](https://github.com/QuocAnh19/Pi_Decor/commit/5003e8a) — refactor(studio): split CurtainColorFilterControl into smaller modules
- [`a33675d`](https://github.com/QuocAnh19/Pi_Decor/commit/a33675d) — refactor(studio): split CustomerEditor into smaller modules
- [`7394aeb`](https://github.com/QuocAnh19/Pi_Decor/commit/7394aeb) — refactor(admin): split AdminStudioPage into smaller modules
- [`1b89ad0`](https://github.com/QuocAnh19/Pi_Decor/commit/1b89ad0) — refactor(studio): split SlotProperties into smaller modules
- [`57f61e9`](https://github.com/QuocAnh19/Pi_Decor/commit/57f61e9) — refactor(studio): split TextAssetCustomizer into smaller modules
- [`d9814a4`](https://github.com/QuocAnh19/Pi_Decor/commit/d9814a4) — refactor(studio): split useAdminEditor into smaller modules
- [`0a15048`](https://github.com/QuocAnh19/Pi_Decor/commit/0a15048) — refactor(admin): split AdminSettingsPage into smaller modules
- [`4ad8009`](https://github.com/QuocAnh19/Pi_Decor/commit/4ad8009) — refactor(admin): split AdminVenuesPage into smaller modules
- [`cecd398`](https://github.com/QuocAnh19/Pi_Decor/commit/cecd398) — refactor(leads): split LeadDetailDrawer into smaller modules
- [`8ec72c7`](https://github.com/QuocAnh19/Pi_Decor/commit/8ec72c7) — refactor(admin): split AdminTestimonialsPage into smaller modules
- [`edd028c`](https://github.com/QuocAnh19/Pi_Decor/commit/edd028c) — refactor(leads): split QuotationModal into smaller modules
- [`9d52057`](https://github.com/QuocAnh19/Pi_Decor/commit/9d52057) — refactor(admin): split AdminProjectsPage into smaller modules
- [`7577c7c`](https://github.com/QuocAnh19/Pi_Decor/commit/7577c7c) — refactor(materials): split MaterialList into smaller modules
- [`47813a3`](https://github.com/QuocAnh19/Pi_Decor/commit/47813a3) — refactor(projects): split ProjectForm into smaller modules
- [`4a93653`](https://github.com/QuocAnh19/Pi_Decor/commit/4a93653) — refactor: single API contract with centralized mappers; remove any

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20261015"></a>2026-10-15

#### Danh sách commit

- [`de2638d`](https://github.com/QuocAnh19/Pi_Decor/commit/de2638d) — refactor(client): migrate data hooks to TanStack Query
- [`87929df`](https://github.com/QuocAnh19/Pi_Decor/commit/87929df) — refactor(client): dedupe studio editors, Modal and slot property code
- [`744b4e0`](https://github.com/QuocAnh19/Pi_Decor/commit/744b4e0) — refactor(client): extract shared admin list components and remove duplicated blocks

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20261013"></a>2026-10-13

#### Danh sách commit

- [`28ac491`](https://github.com/QuocAnh19/Pi_Decor/commit/28ac491) — refactor: serve services, portfolio and testimonials from API instead of static content

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20261012"></a>2026-10-12

#### Danh sách commit

- [`949cbff`](https://github.com/QuocAnh19/Pi_Decor/commit/949cbff) — chore(client): remove dead files, unused API methods and Tailwind; add knip
- [`cd4abf2`](https://github.com/QuocAnh19/Pi_Decor/commit/cd4abf2) — feat(auth): refresh token rotation with reuse detection and logout-all
- [`d93bc4e`](https://github.com/QuocAnh19/Pi_Decor/commit/d93bc4e) — refactor(client): single HTTP client and auth store with single-flight refresh
- [`fd77331`](https://github.com/QuocAnh19/Pi_Decor/commit/fd77331) — perf(server): SQL-level queries, hide draft projects from public API, drop internal fields
- [`4f23487`](https://github.com/QuocAnh19/Pi_Decor/commit/4f23487) — refactor(server): shared media/activity services, DB-managed ids and timestamps, pino logging
- [`9fccf4d`](https://github.com/QuocAnh19/Pi_Decor/commit/9fccf4d) — feat(server): zod validation for all write routes, strip unknown fields
- [`5757f85`](https://github.com/QuocAnh19/Pi_Decor/commit/5757f85) — fix(security): DOMPurify-based SVG sanitizing and stricter image upload
- [`bcb12b8`](https://github.com/QuocAnh19/Pi_Decor/commit/bcb12b8) — refactor(server): consolidate project routes, fix venue delete and timestamps
- [`2acb0e5`](https://github.com/QuocAnh19/Pi_Decor/commit/2acb0e5) — fix(server): verified DB SSL, atomic quotation numbering, remove runtime ALTER
- [`ea0f524`](https://github.com/QuocAnh19/Pi_Decor/commit/ea0f524) — fix(server): fail-closed env validation, trust proxy, body limits, safe error responses
- [`da19e32`](https://github.com/QuocAnh19/Pi_Decor/commit/da19e32) — refactor(server): merge P01 into main
- [`9b6d54a`](https://github.com/QuocAnh19/Pi_Decor/commit/9b6d54a) — refactor(server): remove public designs route and JSON fallback DB
- [`5051d7a`](https://github.com/QuocAnh19/Pi_Decor/commit/5051d7a) — Merge pull request #1 from QuocAnh19/chore/enterprise-hardening
- [`8fd6723`](https://github.com/QuocAnh19/Pi_Decor/commit/8fd6723) — chore: add AGENTS.md, nvmrc, editorconfig and baseline report

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20260902"></a>2026-09-02

#### Danh sách commit

- [`4941880`](https://github.com/QuocAnh19/Pi_Decor/commit/4941880) — update template by customer
- [`4bbb640`](https://github.com/QuocAnh19/Pi_Decor/commit/4bbb640) — fix(nav): route logo and nav link to admin leads when viewing customer template in Studio
- [`b3eb964`](https://github.com/QuocAnh19/Pi_Decor/commit/b3eb964) — fix(studio): hide unnecessary buttons and template switcher when editing customer design snapshot
- [`5b59522`](https://github.com/QuocAnh19/Pi_Decor/commit/5b59522) — fix(studio): resolve customer save design submission, canvas crossOrigin and phone validation issues
- [`054ad48`](https://github.com/QuocAnh19/Pi_Decor/commit/054ad48) — feat: implement Option 1 for customer design snapshot storage and admin studio re-editing
- [`9e9232f`](https://github.com/QuocAnh19/Pi_Decor/commit/9e9232f) — feat(studio): export latest customer design image with PiDecor branding watermark and hotline
- [`a00fe4d`](https://github.com/QuocAnh19/Pi_Decor/commit/a00fe4d) — feat: enhance featured and premium multi-tag display, sorting, and tab filtering
- [`29f4663`](https://github.com/QuocAnh19/Pi_Decor/commit/29f4663) — fix: add price\_tier to database.pg column allowlist and fix ProjectForm edit hydration
- [`a7709bf`](https://github.com/QuocAnh19/Pi_Decor/commit/a7709bf) — feat(client): add priceTier, featured and status to CategoryPortfolioItem
- [`943e0f0`](https://github.com/QuocAnh19/Pi_Decor/commit/943e0f0) — fix(client): use standard color-accent token in Lookbook styles
- [`b3f1cc3`](https://github.com/QuocAnh19/Pi_Decor/commit/b3f1cc3) — feat(client): show price\_tier badge in ProjectAlbumModal
- [`1fe9ac7`](https://github.com/QuocAnh19/Pi_Decor/commit/1fe9ac7) — feat(client): add price\_tier filter and visual badges to Lookbook section
- [`1c66bd3`](https://github.com/QuocAnh19/Pi_Decor/commit/1c66bd3) — feat(client): add price\_tier filter and premium badge in AdminProjectsPage
- [`352171a`](https://github.com/QuocAnh19/Pi_Decor/commit/352171a) — feat(client): add price\_tier select to ProjectForm component
- [`cd6ee87`](https://github.com/QuocAnh19/Pi_Decor/commit/cd6ee87) — feat(client): add price\_tier filtering and payload support in useProjects hook
- [`218bfb1`](https://github.com/QuocAnh19/Pi_Decor/commit/218bfb1) — feat(client): add priceTier and PRICE\_TIER\_OPTIONS to projects types
- [`8cb418a`](https://github.com/QuocAnh19/Pi_Decor/commit/8cb418a) — feat(client): add price\_tier to Project and ProjectPayload interfaces
- [`18157f4`](https://github.com/QuocAnh19/Pi_Decor/commit/18157f4) — feat(server): add price\_tier support to venues nested project routes
- [`57e1db0`](https://github.com/QuocAnh19/Pi_Decor/commit/57e1db0) — feat(server): add price\_tier support and validation to projects routes
- [`e8768f3`](https://github.com/QuocAnh19/Pi_Decor/commit/e8768f3) — feat(db): add migration 0024 to add price\_tier column to projects table

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20260824"></a>2026-08-24

#### Danh sách commit

- [`c0e99e1`](https://github.com/QuocAnh19/Pi_Decor/commit/c0e99e1) — fix(client): add useCallback import in authContext
- [`bfd3971`](https://github.com/QuocAnh19/Pi_Decor/commit/bfd3971) — chore(client): resolve lint errors across components and hooks
- [`416a843`](https://github.com/QuocAnh19/Pi_Decor/commit/416a843) — feat(server): validate required production environment variables on startup
- [`6cf060e`](https://github.com/QuocAnh19/Pi_Decor/commit/6cf060e) — refactor(client): unify image capture dependencies to html-to-image and remove html2canvas
- [`bf15e92`](https://github.com/QuocAnh19/Pi_Decor/commit/bf15e92) — refactor(server): hoist all imports to the top of app.js
- [`1257492`](https://github.com/QuocAnh19/Pi_Decor/commit/1257492) — fix(client): create ApiError class with status code for reliable 401 token refresh
- [`999b94c`](https://github.com/QuocAnh19/Pi_Decor/commit/999b94c) — security: enforce strict JWT secret validation and centralize auth config
- [`e57438d`](https://github.com/QuocAnh19/Pi_Decor/commit/e57438d) — chore: update .gitignore, untrack build artifacts/runtime data, and add db.example.json
- [`c1d8da0`](https://github.com/QuocAnh19/Pi_Decor/commit/c1d8da0) — Add thumbnail in studio feature

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20260815"></a>2026-08-15

#### Danh sách commit

- [`1553c19`](https://github.com/QuocAnh19/Pi_Decor/commit/1553c19) — update landingpage
- [`ac65d1b`](https://github.com/QuocAnh19/Pi_Decor/commit/ac65d1b) — update UX/UI landingpage
- [`fd9ff25`](https://github.com/QuocAnh19/Pi_Decor/commit/fd9ff25) — remove md file
- [`61b4b2a`](https://github.com/QuocAnh19/Pi_Decor/commit/61b4b2a) — update UX admin page

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20260814"></a>2026-08-14

#### Danh sách commit

- [`3dffa63`](https://github.com/QuocAnh19/Pi_Decor/commit/3dffa63) — update validate value
- [`c12204f`](https://github.com/QuocAnh19/Pi_Decor/commit/c12204f) — update base v2

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20260808"></a>2026-08-08

#### Danh sách commit

- [`5db6bcd`](https://github.com/QuocAnh19/Pi_Decor/commit/5db6bcd) — update admin task

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---

### <a id="20260807"></a>2026-08-07

#### Danh sách commit

- [`0cbfad9`](https://github.com/QuocAnh19/Pi_Decor/commit/0cbfad9) — Add admin page
- [`8220611`](https://github.com/QuocAnh19/Pi_Decor/commit/8220611) — Add admin page
- [`8b95c12`](https://github.com/QuocAnh19/Pi_Decor/commit/8b95c12) — First commit

#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)

<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->

---
