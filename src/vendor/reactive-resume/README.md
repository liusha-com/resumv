# Reactive Resume source attribution

Upstream: https://github.com/reactive-resume/reactive-resume
License: MIT, Copyright (c) 2026 Amruth Pillai. Full license in LICENSE and /licenses/reactive-resume.txt.
Pinned upstream revision: see UPSTREAM_COMMIT.

The PDF rendering templates, schema, rendering support, and complete sample resume were copied from upstream. `schema/resume/sample.ts` is an unchanged copy of `packages/schema/src/resume/sample.ts` at the pinned revision. `schema/resume/sample-picture.json` embeds upstream `apps/web/public/photos/sample-picture.jpg` as a data URI for offline rendering. The browser editor shell is a resumv adaptation of the upstream left-content / canvas / right-design interaction model. No upstream authentication, API, database, AI service, or server is included.

The 15 style previews are generated locally from this upstream sample (David Kowalski), with all sections and automatic continuous pagination, including the cover letter. Local Lato fonts replace the upstream font families. Template selection changes only the template ID and accent color. Role-specific SEO examples are separate Resumv content and are not attributed to the upstream sample.

Local modifications:
- Font registration uses locally bundled Lato plus built-in PDF fonts to avoid runtime font service requests.
- Package import aliases resolve to this directory from Astro/Vite.
- Required text fields allow empty strings so unfinished browser drafts can be saved and reloaded.
- Browser data is validated and sanitized by src/lib/resume-model.ts before reaching the renderer.

The original template components and semantic rendering logic are retained. Supported templates: Azurill, Bronzor, Chikorita, Ditgar, Ditto, Gengar, Glalie, Kakuna, Lapras, Leafish, Meowth, Onyx, Pikachu, Rhyhorn, Scizor.


