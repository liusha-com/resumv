# Resumv

**English** | [简体中文](README-zh.md)

**No sign-up. No login. Your resume stays in your browser.**

Resumv is a free, open-source resume builder that adapts and improves the resume templates and rendering capabilities of [Reactive Resume](https://github.com/reactive-resume/reactive-resume). Built with Astro and React, it removes the registration and login modules and the dependency on cloud accounts, so you can edit, preview, save, and export your resume directly in your browser.

It is designed for people who value their privacy, prefer to keep their resumes off online resume platforms, or want to host their own resume builder.

[Try Resumv](https://resumv.com) · [Build a resume](https://resumv.com/builder/) · [Browse templates](https://resumv.com/templates/) · [Upstream project](https://github.com/reactive-resume/reactive-resume)

## Why Resumv?

- **No account required:** Start immediately without registering, logging in, or sharing account information.
- **Local storage:** Resume content is saved automatically in your browser's `localStorage`, without being uploaded to the project's servers or a database.
- **Browser-based processing:** Resume editing, PDF generation and preview, and Word and Markdown exports all run in your browser.
- **Free to use:** No paid templates, subscriptions, or export paywalls.
- **Easy to self-host:** A static site with no user database, authentication service, or AI API key to configure.
- **Clear template attribution:** All 15 resume templates come from Reactive Resume, with upstream copyright and license notices preserved.

## Features

### Resume editor and templates

- A three-panel editor for content, preview, and design, with switchable panels on mobile.
- Personal details, photos, summaries, experience, education, skills, projects, and custom sections.
- Rich text editing, section ordering, main-column and sidebar placement, visibility controls, undo, and redo.
- Customizable fonts, font sizes, colors, page margins, column widths, and A4 or Letter paper sizes.
- Live PDF preview with automatic pagination, zoom, and fit-to-width controls.
- Multiple locally saved documents, with JSON backup and restore.

Available templates: Onyx, Azurill, Bronzor, Chikorita, Ditgar, Ditto, Gengar, Glalie, Kakuna, Lapras, Leafish, Meowth, Pikachu, Rhyhorn, and Scizor. Some layouts have been adapted for this project; Onyx, Kakuna, and Meowth use a two-column layout with a right sidebar.

> Selecting a template card on the right side of the editor currently loads the complete example shown in its thumbnail, including its text, photo, and design. Use Undo to restore your previous content. You can also export a JSON backup before making changes to your own resume.

### Downloads and backups

| Format | Purpose |
| --- | --- |
| PDF (default) | Preserves the layout shown in the PDF preview, ready for applications and printing |
| Word (`.docx`) | An editable document that includes both main-column and sidebar content for two-column templates; decorative details and pagination may differ from the PDF |
| Markdown (`.md`) | Text content with headings, lists, emphasis, and links |
| JSON (`.json`) | Resume content and design settings for backups, transfers, and reimporting |

JSON import supports Resumv exports and Reactive Resume v5 resume data. Imports remove unsafe HTML, remote images, and custom style rules, and replace unsupported fonts with local alternatives.

The project also includes a cover letter editor, a resume checker, career advice, and a summary drafting tool based on the facts you provide. The resume checker extracts text from PDF, DOCX, and TXT files in your browser; it does not automatically convert those files into editable Builder resumes. Cover letters have a separate printing and export workflow.

## Privacy and data storage

Production builds include Google Analytics 4 (`G-K9BQT3MPCN`) for website traffic and usage statistics; the development server does not load it. Google may receive page URLs, referrers, device/browser information and interaction events, and may use analytics cookies. No custom analytics events containing resume content or form values are added. Self-hosters should remove or replace the Google tag in `src/components/seo/Head.astro` before deploying.

Resumv has no resume upload endpoint, cloud resume synchronization, or external AI service for processing resume content. Fonts are bundled locally, with no runtime dependency on a font CDN.

Local storage gives you control over your data, with a few practical limits:

- Data belongs to the current browser, device, and site address. It does not automatically sync across devices or domains.
- Clearing site data, resetting your browser, or ending a private browsing session may erase your resumes. Export JSON backups regularly.
- Browser storage is not an encrypted vault. Other people using the same browser profile, and extensions with sufficient permissions, may be able to access it.
- Visiting the hosted site still requests pages and static assets from the hosting provider, which may keep ordinary access logs such as IP addresses. These requests do not upload your resume content.

The header and footer fetch the public GitHub star count and latest `main` commit without credentials or a referrer and cache them in session storage for 15 minutes. The footer hash identifies the latest upstream commit, not necessarily the deployed version. GitHub receives ordinary connection information, such as your IP address, but no resume content. Feedback submitted to GitHub Issues is public.

For more control over the environment, run the project on your own computer or a server you trust.

## Run locally

You need **Node.js 22.12.0 or later** and **Bun**. After obtaining the repository, run the following commands from its root directory:

```bash
bun install --frozen-lockfile
bun run dev -- --background
```

Open [http://localhost:4321](http://localhost:4321) by default.

Manage the background development server:

```bash
bun run astro dev status
bun run astro dev logs
bun run astro dev stop
```

Run checks and create a production build:

```bash
bun run typecheck
bun run test
bun run build
node tests/check-built-seo.mjs
```

The build output is written to `dist/`. Use `bun run preview` to preview the production build locally.

## Deployment

Deploy `dist/` to a static hosting provider. No account service or database is required.

The repository includes a Cloudflare Workers static assets configuration and a GitHub Actions deployment workflow:

1. Update the Worker name in `wrangler.jsonc` to use your own Cloudflare resources.
2. Configure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub Actions Secrets. Never commit real credentials to the repository.
3. Pull requests targeting `main` run type checks, tests, a production build, and static page checks. PR checks do not use Cloudflare credentials or deploy the site.
4. Merging a PR into `main` triggers the checks again and deploys the validated build to Cloudflare Workers. Direct pushes to `main` also trigger this process; commit messages no longer need to contain `prod`.
5. In GitHub branch protection or a ruleset for `main`, require a pull request and the `Validate and build` status check before merging if you want all changes to go through review. Adjust or remove the deployment workflow when forking for your own use.

When using your own domain, also update `site` in `astro.config.mjs`, references to `https://resumv.com` in the source, sitemap URLs, structured data, and GitHub repository/feedback links (including the star-count API URL in `src/components/GitHubLink.tsx`).

## Technology and project structure

Core technologies: Astro, React, TypeScript, React PDF, PDF.js, docx, and DOMPurify.

```text
src/components/builder/     Resume editor and PDF preview
src/lib/                    Validation, local storage, imports, and exports
src/data/                   Template catalog, role-specific resume data, and articles
src/pages/                  Site pages and static routes
src/vendor/reactive-resume/ Upstream templates, schemas, and PDF rendering code
public/templates/           Template preview images
public/licenses/            Third-party license notices
scripts/                    Utilities such as template preview generation
tests/                      Data, export, and static page checks
```

The current interface and default fonts primarily support English and Latin-script resumes. Upstream multilingual font CDN fallbacks are not included. Migration from Reactive Resume v4 JSON is also not supported yet.

## License

Resumv is licensed under the [MIT License](LICENSE), copyright 2026 liusha-com and Resumv contributors. Third-party code and assets retain their own licenses and copyright notices.

## Credits and third-party licenses

Thank you to [Reactive Resume](https://github.com/reactive-resume/reactive-resume), its creator **Amruth Pillai**, and all its contributors. Resumv adapts that project's resume templates, PDF rendering support, data schemas, and sample resumes. This is an independent adaptation, not an official Reactive Resume release.

- Reactive Resume code is licensed under the **MIT License**. Its original copyright notice is preserved in the [upstream license](src/vendor/reactive-resume/LICENSE).
- The vendored upstream revision is recorded in [UPSTREAM_COMMIT](src/vendor/reactive-resume/UPSTREAM_COMMIT).
- TikTok Sans and Lato use the **SIL Open Font License**. Their license files are in [public/licenses](public/licenses/).

Preserve the relevant copyright and license notices when distributing third-party code or fonts included in this project.

## Contributing

[Issues](https://github.com/liusha-com/resumv/issues) and pull requests are welcome, whether they improve templates, editing, export quality, accessibility, or documentation.

Use fictional resumes or anonymized examples when reporting issues. Do not include real identity documents, contact details, private resumes, or API keys in public issues.

Security vulnerabilities should be reported privately; see [SECURITY.md](SECURITY.md).
