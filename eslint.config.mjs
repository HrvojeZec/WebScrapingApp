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
  meta: [],
  product: [],
  "scrape-job": ["store"],
  store: [],
};

const WEB_SRC = "apps/web/src";

/** Pre-FSD code that breaks the slice conventions until Task 6 (#26) replaces it. */
const LEGACY_WEB_FILES = [
  `${WEB_SRC}/views/search/**`,
  `${WEB_SRC}/views/result/**`,
  `${WEB_SRC}/entities/product/model/**`,
  `${WEB_SRC}/shared/ui/BrandLogo/**`,
  `${WEB_SRC}/shared/ui/Loader/**`,
  `${WEB_SRC}/shared/ui/Notification/**`,
];

const REACT_QUERY_HOOKS = ["useQuery", "useMutation", "useInfiniteQuery", "useSuspenseQuery"];

/**
 * The slice conventions from the web plan. They use rules other than no-restricted-imports,
 * because a later block with that rule would replace the layer rules for the same files.
 */
const sliceConventions = [
  {
    files: [`${WEB_SRC}/**/*.{ts,tsx}`],
    ignores: [`${WEB_SRC}/shared/api/**`, ...LEGACY_WEB_FILES],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "fetch", message: "Call the API through baseApi from @/shared/api/base-api." },
      ],
    },
  },
  {
    files: [`${WEB_SRC}/**/ui/**/*.{ts,tsx}`, `${WEB_SRC}/views/*/*View.tsx`],
    ignores: LEGACY_WEB_FILES,
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `ImportDeclaration[source.value='@tanstack/react-query'] > ImportSpecifier[imported.name=/^(${REACT_QUERY_HOOKS.join("|")})$/]`,
          message: "Components only render: read queries through a hook in the slice's hooks/.",
        },
      ],
    },
  },
  {
    files: [`${WEB_SRC}/**/{lib,hooks,api}/**/*.{ts,tsx}`],
    ignores: [
      `${WEB_SRC}/**/__tests__/**`,
      `${WEB_SRC}/**/constants/**`,
      `${WEB_SRC}/**/model/constants.ts`,
      `${WEB_SRC}/shared/theme/**`,
      ...LEGACY_WEB_FILES,
    ],
    rules: {
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          ignore: [-1, 0, 1],
          ignoreArrayIndexes: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreTypeIndexes: true,
          ignoreReadonlyClassProperties: true,
        },
      ],
    },
  },
];

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
    srcDir: WEB_SRC,
    slices: readSlices(new URL("./apps/web/src/", import.meta.url)),
    entityDeps: ENTITY_DEPS,
  }),
  ...sliceConventions,
  // Must stay last so it can disable stylistic rules that conflict with Prettier
  prettier,
);
