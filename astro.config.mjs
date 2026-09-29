// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    // Prebundle the lazy editor/import dependencies before a browser opens them.
    // Discovering these during hydration invalidates the active module graph.
    optimizeDeps: {
      include: [
        "@react-pdf/renderer",
        "react-pdf-html",
        "phosphor-icons-react-pdf",
        "pdfjs-dist",
        "docx",
        "fflate",
      ],
    },
    resolve: {
      alias: {
        "#react-pdf-renderer": "@react-pdf/renderer",
        ...Object.fromEntries(
          ["pdf", "resume", "schema", "fonts", "utils"].map((name) => [
            `@reactive-resume/${name}`,
            fileURLToPath(
              new URL(`./src/vendor/reactive-resume/${name}`, import.meta.url),
            ),
          ]),
        ),
      },
    },
  },
  site: "https://resumv.com",
  trailingSlash: "always",
});
