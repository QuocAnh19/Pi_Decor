import { readdirSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";

function checkDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      checkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      execFileSync(process.execPath, ["--check", fullPath], { stdio: "inherit" });
    }
  }
}

const targetDir = process.argv[2] || "apps/api/src";
checkDir(targetDir);
console.log(`✓ Node syntax check passed for all files in ${targetDir}`);
