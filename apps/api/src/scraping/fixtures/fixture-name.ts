// Letters, digits and dashes only, so --save can never point outside __fixtures__
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9-]*$/;

/** The file name (without .html) for live-check --save, or null when the given name is unsafe. */
export function fixtureName(save: string | true, defaultName: string): string | null {
  const name = save === true ? defaultName : save;
  return SAFE_NAME.test(name) ? name : null;
}
