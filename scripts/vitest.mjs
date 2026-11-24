// Runs Vitest with the drive letter of the working directory in upper case. On Windows, a
// lowercase drive letter (VS Code terminals report c:\) makes Vitest load two module instances,
// and every suite then fails with "Cannot read properties of undefined (reading 'config')".
import { spawnSync } from "node:child_process";

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const { status } = spawnSync("npx", ["vitest", ...process.argv.slice(2)], {
  cwd,
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(status ?? 1);
