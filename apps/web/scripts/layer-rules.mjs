// ESLint rules for the Feature-Sliced layers in apps/web/src:
// app → views → widgets → features → entities → shared.
// A slice may import only from the layers below its own; slices of one layer don't import each
// other, except entities along an explicit, acyclic dependency table. Used by eslint.config.mjs.
import { existsSync, readdirSync } from "node:fs";

/** @typedef {"views" | "widgets" | "features" | "entities"} Layer */

/** The layers that hold slices, top first. app sits above them and shared below them all. */
export const LAYERS = /** @type {const} */ (["views", "widgets", "features", "entities"]);

/** @param {Layer} layer */
const higherLayers = (layer) => ["app", ...LAYERS.slice(0, LAYERS.indexOf(layer))];

/**
 * @param {string[]} entities
 * @param {Record<string, string[]>} entityDeps
 */
function checkEntityDeps(entities, entityDeps) {
  for (const entity of entities) {
    if (!entityDeps[entity]) {
      throw new Error(`Entity "${entity}" is missing from ENTITY_DEPS (eslint.config.mjs)`);
    }
    for (const dependency of entityDeps[entity]) {
      if (!entities.includes(dependency)) {
        throw new Error(`Entity "${entity}" depends on unknown entity "${dependency}"`);
      }
    }
  }
}

/**
 * Flat-config blocks with `no-restricted-imports` for every slice and for shared. A later block
 * replaces the rule of an earlier one for the same files, so every block carries all its patterns.
 *
 * @param {{
 *   srcDir: string,
 *   slices: Partial<Record<Layer, string[]>>,
 *   entityDeps: Record<string, string[]>,
 * }} options `srcDir` is relative to the directory of the ESLint config.
 */
export function layerImportRules({ srcDir, slices, entityDeps }) {
  checkEntityDeps(slices.entities ?? [], entityDeps);
  const blocks = [];

  for (const layer of LAYERS) {
    const layerSlices = slices[layer] ?? [];
    for (const slice of layerSlices) {
      const allowed = layer === "entities" ? [slice, ...entityDeps[slice]] : [slice];
      const patterns = [
        {
          group: higherLayers(layer).map((name) => `@/${name}/*`),
          message: `${layer} may only import from the layers below it.`,
        },
      ];
      const siblings = layerSlices.filter((name) => !allowed.includes(name));
      if (siblings.length > 0) {
        patterns.push({
          group: siblings.map((name) => `@/${layer}/${name}/*`),
          message:
            layer === "entities"
              ? "An entity may only import the entities in ENTITY_DEPS (eslint.config.mjs)."
              : `Slices of ${layer} don't import each other; move the shared part a layer down.`,
        });
      }
      blocks.push({
        files: [`${srcDir}/${layer}/${slice}/**`],
        rules: { "no-restricted-imports": ["error", { patterns }] },
      });
    }
  }

  blocks.push({
    files: [`${srcDir}/shared/**`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["app", ...LAYERS].map((name) => `@/${name}/*`),
              message: "shared must not depend on the layers above it; move the code up.",
            },
          ],
        },
      ],
    },
  });
  return blocks;
}

/**
 * The slice folders of every layer under `srcDir`; a layer without a folder has none.
 *
 * @param {URL} srcDir
 * @returns {Record<Layer, string[]>}
 */
export function readSlices(srcDir) {
  return /** @type {Record<Layer, string[]>} */ (
    Object.fromEntries(
      LAYERS.map((layer) => {
        const dir = new URL(`${layer}/`, srcDir);
        if (!existsSync(dir)) return [layer, []];
        const entries = readdirSync(dir, { withFileTypes: true });
        return [layer, entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)];
      }),
    )
  );
}
