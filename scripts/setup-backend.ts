import fs from "node:fs";
import path from "node:path";
import os from "node:os";

function loadEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return env;

  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
  return env;
}

function resolvePath(inputPath: string, baseDir: string): string {
  let expanded = inputPath.trim();

  // Expand home directory (`~` or `~/...`) on Linux/macOS/Windows
  if (expanded === "~") {
    expanded = os.homedir();
  } else if (expanded.startsWith("~/") || expanded.startsWith("~\\")) {
    expanded = path.join(os.homedir(), expanded.slice(2));
  }

  return path.isAbsolute(expanded)
    ? path.normalize(expanded)
    : path.resolve(baseDir, expanded);
}

function isPathEqual(pathA: string, pathB: string): boolean {
  if (process.platform === "win32" || process.platform === "darwin") {
    return pathA.toLowerCase() === pathB.toLowerCase();
  }
  return pathA === pathB;
}

function safeRemoveLink(linkPath: string) {
  try {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(linkPath);
    } else if (stat.isDirectory()) {
      // On Windows, NTFS junctions can sometimes be reported as directories
      fs.rmdirSync(linkPath);
    } else {
      fs.unlinkSync(linkPath);
    }
  } catch (err) {
    // If standard unlink fails, try force removal
    fs.rmSync(linkPath, { recursive: true, force: true });
  }
}

function setupBackendLink() {
  const rootDir = path.resolve(__dirname, "..");
  const envLocalPath = path.join(rootDir, ".env.local");
  const envLocal = loadEnvFile(envLocalPath);

  const rawConfiguredPath =
    process.env.BACKEND_PATH ||
    envLocal.BACKEND_PATH ||
    "../../elysia/fintrack-be";

  const targetPath = resolvePath(rawConfiguredPath, rootDir);
  const linkPath = path.join(rootDir, "backend");

  if (!fs.existsSync(targetPath)) {
    const examplePath =
      process.platform === "win32"
        ? "C:/path/to/fintrack-be or ../../elysia/fintrack-be"
        : "~/projects/fintrack-be or ../../elysia/fintrack-be";

    console.error(
      `\x1b[31m[setup-backend] Backend directory not found at: ${targetPath}\x1b[0m\n` +
      `Please configure the correct path in your .env.local file:\n` +
      `  BACKEND_PATH=${examplePath}\n`
    );
    process.exit(1);
  }

  // Check if link already exists and points to the correct target
  if (fs.existsSync(linkPath)) {
    try {
      const currentReal = fs.realpathSync(linkPath);
      const expectedReal = fs.realpathSync(targetPath);
      if (isPathEqual(currentReal, expectedReal)) {
        console.log(`[setup-backend] Linked backend directory is up to date: ${linkPath} -> ${targetPath}`);
        return;
      }
    } catch {
      // Continue to recreate if checking fails
    }

    safeRemoveLink(linkPath);
  }

  // Windows uses "junction" (doesn't require admin/dev mode), Linux/macOS uses "dir"
  const linkType = process.platform === "win32" ? "junction" : "dir";

  try {
    fs.symlinkSync(targetPath, linkPath, linkType);
    console.log(`\x1b[32m[setup-backend] Successfully linked backend directory:\x1b[0m\n  ${linkPath} -> ${targetPath}`);
  } catch (err) {
    // If junction fails on Windows, try standard symlink or print helpful message
    if (process.platform === "win32" && linkType === "junction") {
      try {
        fs.symlinkSync(targetPath, linkPath, "dir");
        console.log(`\x1b[32m[setup-backend] Successfully linked backend directory (dir symlink):\x1b[0m\n  ${linkPath} -> ${targetPath}`);
        return;
      } catch (innerErr) {
        // Fall through to error reporting below
      }
    }

    console.error(`\x1b[31m[setup-backend] Failed to create symlink: ${err}\x1b[0m`);
    process.exit(1);
  }
}

setupBackendLink();
