import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier/flat";
import { layerImportRules, readSlices } from "./apps/web/scripts/layer-rules.mjs";

/**
 * Which entities each web entity may import. Every entity slice needs an entry, and the graph
 * must stay acyclic: an entity that needs another one either depends on it here or moves down.
 */
const ENTITY_DEPS = {
  product: [],
};

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "playwright-report/**",
      "test-results/**",
      // Local-only planning files (excluded from git, not part of the project)
      "docs/plan/**",
      ".superpowers/**",
      // Vendored third-party components keep their upstream code
      "apps/web/src/shared/vendor/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: [
      "apps/api/**/*.{ts,js}",
      "packages/**/*.{ts,js}",
      "**/*.{cjs,mjs}",
      "apps/web/vite.config.ts",
      "apps/web/vitest.config.ts",
      "apps/web/scripts/**",
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-refresh/only-export-components": ["error", { allowConstantExport: true }],
    },
  },
  ...layerImportRules({
    srcDir: "apps/web/src",
    slices: readSlices(new URL("./apps/web/src/", import.meta.url)),
    entityDeps: ENTITY_DEPS,
  }),
  // Must stay last so it can disable stylistic rules that conflict with Prettier
  prettier,
);
