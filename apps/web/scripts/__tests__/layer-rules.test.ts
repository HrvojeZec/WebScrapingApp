import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ESLint, type Linter } from "eslint";
import tseslint from "typescript-eslint";
import { describe, expect, it } from "vitest";
import { layerImportRules, readSlices } from "../layer-rules.mjs";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const srcDir = "apps/web/src";

/** The messages ESLint reports for `code` saved at `filePath` (relative to the repo root). */
async function lint(eslint: ESLint, code: string, filePath: string) {
  const [result] = await eslint.lintText(code, { filePath: `${repoRoot}${filePath}` });
  return result!.messages.map(({ ruleId, message }) => ({ ruleId, message }));
}

/** An ESLint instance that applies only the layer rules built from the given slices. */
function eslintWith(options: Parameters<typeof layerImportRules>[0]) {
  return new ESLint({
    cwd: repoRoot,
    overrideConfigFile: true,
    overrideConfig: [
      { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser } },
      ...(layerImportRules(options) as Linter.Config[]),
    ],
  });
}

describe("the root ESLint config", () => {
  const eslint = new ESLint({ cwd: repoRoot });

  it("stops an entity from importing a view", async () => {
    const messages = await lint(
      eslint,
      'import x from "@/views/home/HomeView";\nexport default x;\n',
      `${srcDir}/entities/product/a.ts`,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]!.ruleId).toBe("no-restricted-imports");
    expect(messages[0]!.message).toContain("may only import from the layers below it");
  });

  it("stops shared from importing a widget", async () => {
    const messages = await lint(
      eslint,
      'import x from "@/widgets/app-shell/ui/Header";\nexport default x;\n',
      `${srcDir}/shared/ui/a.tsx`,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]!.message).toContain("shared must not depend on the layers above it");
  });
});

describe("the slice conventions in the root ESLint config", () => {
  const eslint = new ESLint({ cwd: repoRoot });

  /** The rule ids ESLint reports for `code` at `filePath`, without the layer and React rules. */
  async function conventionRules(code: string, filePath: string) {
    const messages = await lint(eslint, code, filePath);
    return messages
      .map(({ ruleId }) => ruleId)
      .filter((ruleId) =>
        [
          "no-restricted-globals",
          "no-restricted-syntax",
          "@typescript-eslint/no-magic-numbers",
        ].includes(ruleId ?? ""),
      );
  }

  const callFetch = 'export const load = () => fetch("/api/meta");\n';
  const callUseQuery =
    'import { useQuery } from "@tanstack/react-query";\nexport const useX = () => useQuery({ queryKey: ["x"] });\n';
  const magicNumber = "export const scale = (y: number) => 42 * y;\n";

  it("allows fetch only in shared/api", async () => {
    expect(await conventionRules(callFetch, `${srcDir}/features/a/ui/A/A.tsx`)).toEqual([
      "no-restricted-globals",
    ]);
    expect(await conventionRules(callFetch, `${srcDir}/shared/api/base-api.ts`)).toEqual([]);
  });

  it("keeps react-query hooks out of components and views", async () => {
    expect(await conventionRules(callUseQuery, `${srcDir}/entities/x/ui/X/X.tsx`)).toEqual([
      "no-restricted-syntax",
    ]);
    expect(await conventionRules(callUseQuery, `${srcDir}/views/home/HomeView.tsx`)).toEqual([
      "no-restricted-syntax",
    ]);
    expect(await conventionRules(callUseQuery, `${srcDir}/entities/x/hooks/useX.ts`)).toEqual([]);
  });

  it("keeps the layer rules on component files", async () => {
    const messages = await lint(
      eslint,
      'import x from "@/views/home/HomeView";\nexport default x;\n',
      `${srcDir}/entities/product/ui/P/P.tsx`,
    );

    expect(messages.map(({ ruleId }) => ruleId)).toContain("no-restricted-imports");
  });

  it("wants named constants instead of magic numbers in lib, hooks and api", async () => {
    expect(await conventionRules(magicNumber, `${srcDir}/entities/x/lib/a.ts`)).toEqual([
      "@typescript-eslint/no-magic-numbers",
    ]);
    expect(await conventionRules(magicNumber, `${srcDir}/shared/api/a.ts`)).toEqual([
      "@typescript-eslint/no-magic-numbers",
    ]);
    expect(await conventionRules(magicNumber, `${srcDir}/entities/x/model/constants.ts`)).toEqual(
      [],
    );
    expect(
      await conventionRules(magicNumber, `${srcDir}/entities/x/lib/__tests__/a.test.ts`),
    ).toEqual([]);
  });
});

describe("layerImportRules", () => {
  const eslint = eslintWith({
    srcDir,
    slices: {
      views: ["home"],
      widgets: ["app-shell"],
      features: ["a", "b"],
      entities: ["store", "scrape-job"],
    },
    entityDeps: { store: [], "scrape-job": ["store"] },
  });

  it("stops one feature from importing another", async () => {
    const messages = await lint(
      eslint,
      'import x from "@/features/b/x";\nexport default x;\n',
      `${srcDir}/features/a/a.ts`,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]!.message).toContain("Slices of features don't import each other");
  });

  it("lets a feature import an entity and shared", async () => {
    const messages = await lint(
      eslint,
      'import x from "@/entities/store/x";\nimport y from "@/shared/y";\nexport { x, y };\n',
      `${srcDir}/features/a/a.ts`,
    );

    expect(messages).toEqual([]);
  });

  it("lets an entity import the entities it depends on, and no others", async () => {
    const allowed = await lint(
      eslint,
      'import x from "@/entities/store/model/types";\nexport default x;\n',
      `${srcDir}/entities/scrape-job/a.ts`,
    );
    const forbidden = await lint(
      eslint,
      'import x from "@/entities/scrape-job/model/types";\nexport default x;\n',
      `${srcDir}/entities/store/a.ts`,
    );

    expect(allowed).toEqual([]);
    expect(forbidden).toHaveLength(1);
    expect(forbidden[0]!.message).toContain("ENTITY_DEPS");
  });

  it("stops every layer from importing the app layer", async () => {
    const messages = await lint(
      eslint,
      'import x from "@/app/router";\nexport default x;\n',
      `${srcDir}/views/home/a.ts`,
    );

    expect(messages).toHaveLength(1);
  });

  it("stops a relative import from climbing into another layer", async () => {
    const fromView = await lint(
      eslint,
      'import x from "../../../widgets/app-shell/ui/Header";\nexport default x;\n',
      `${srcDir}/views/home/ui/a.ts`,
    );
    const fromShared = await lint(
      eslint,
      'import x from "../../entities/store/x";\nexport default x;\n',
      `${srcDir}/shared/ui/a.ts`,
    );

    expect(fromView).toHaveLength(1);
    expect(fromView[0]!.message).toContain("through @/");
    expect(fromShared).toHaveLength(1);
  });

  it("lets a slice import its own files relatively", async () => {
    const messages = await lint(
      eslint,
      'import x from "../model/x";\nimport y from "./y";\nexport { x, y };\n',
      `${srcDir}/features/a/ui/a.ts`,
    );

    expect(messages).toEqual([]);
  });

  it("reports an entity missing from the dependency table", () => {
    expect(() =>
      layerImportRules({
        srcDir,
        slices: { entities: ["store", "meta"] },
        entityDeps: { store: [] },
      }),
    ).toThrow(/meta/);
  });

  it("reports an entity that depends on an unknown entity", () => {
    expect(() =>
      layerImportRules({
        srcDir,
        slices: { entities: ["scrape-job"] },
        entityDeps: { "scrape-job": ["store"] },
      }),
    ).toThrow(/store/);
  });
});

describe("readSlices", () => {
  it("lists the slice folders of each layer, and none for a missing layer folder", () => {
    const src = mkdtempSync(join(tmpdir(), "layer-rules-"));
    try {
      mkdirSync(join(src, "entities", "product"), { recursive: true });
      mkdirSync(join(src, "entities", "store"));
      writeFileSync(join(src, "entities", "notes.md"), "");
      mkdirSync(join(src, "views", "home"), { recursive: true });

      const slices = readSlices(pathToFileURL(`${src}/`));

      expect(slices).toEqual({
        views: ["home"],
        widgets: [],
        features: [],
        entities: ["product", "store"],
      });
    } finally {
      rmSync(src, { recursive: true, force: true });
    }
  });
});
