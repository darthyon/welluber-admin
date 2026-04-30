import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "../..")

console.error("ROOT:", ROOT)

const TARGET_DIRS = ["app", "components", "features"]
const EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"])

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(fullPath)
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      yield fullPath
    }
  }
}

const BANNED = [
  { pattern: /\b(?:bg|text)-emerald-(?:50|100|200|300|400|500|600|700)(?:\/\d+)?\b/, message: "emerald", exempt: ["components/shared/status-badge.tsx", "components/shared/pulse-status.tsx"] },
]

function isExempt(filePath, rule) {
  const rel = path.relative(ROOT, filePath)
  for (const exempt of rule.exempt) {
    if (rel.includes(exempt)) return true
  }
  return false
}

let found = false
for (const target of TARGET_DIRS) {
  const dir = path.join(ROOT, target)
  if (!fs.existsSync(dir)) continue
  for (const filePath of walk(dir)) {
    const relPath = path.relative(ROOT, filePath)
    if (!relPath.includes("location-picker")) continue
    console.error("Scanning:", relPath)
    const content = fs.readFileSync(filePath, "utf-8")
    const lines = content.split("\n")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      for (const rule of BANNED) {
        if (isExempt(filePath, rule)) {
          console.error("EXEMPT", relPath)
          continue
        }
        if (rule.pattern.test(line)) {
          console.log(`${relPath}:${i + 1}: ${rule.message}`)
          found = true
          break
        }
      }
    }
  }
}

if (!found) console.log("NOT FOUND")
