#!/usr/bin/env node
/**
 * Design System Guardrail
 * Scans source files for hardcoded colors, banned patterns, and token bypasses.
 * Run with: node .agents/scripts/design-lint.js
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.resolve(__dirname, "../..")
const TARGET_DIRS = ["app", "components", "features"]
const EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"])

// Files exempt from certain rules
const BRAND_SVGS = ["welluber-logo.tsx", "welluber-mark.tsx"]

const BANNED = [
  {
    pattern: /\bfont-bold\b/,
    message: "Use font-semibold (600) instead of font-bold (700)",
    exempt: [],
  },
  {
    pattern: /\btext-white\b/,
    message: "Use text-primary-foreground or tokens instead of text-white",
    exempt: BRAND_SVGS,
  },
  {
    pattern: /\bbg-white\b/,
    message: "Use bg-background or bg-card instead of bg-white",
    exempt: BRAND_SVGS,
  },
  {
    pattern: /\b(?:bg|border|text)-zinc-\d+/,
    message: "Use token utilities (border-border, bg-muted, text-muted-foreground) instead of zinc-*",
    exempt: [],
  },
  {
    pattern: /\b(?:bg|border|text)-slate-\d+/,
    message: "Use token utilities instead of slate-*",
    exempt: [],
  },
  {
    pattern: /\b(?:bg|text)-red-500\b/,
    message: "Use destructive token instead of red-500",
    exempt: [],
  },
  {
    pattern: /\b(?:bg|text)-red-600\b/,
    message: "Use destructive token instead of red-600",
    exempt: [],
  },
  {
    pattern: /\b(?:bg|text)-indigo-\d+\b/,
    message: "Use primary token instead of indigo-* for structural UI",
    exempt: [],
  },
  {
    pattern: /\b(?:bg|text)-blue-\d+\b/,
    message: "Use primary token instead of blue-* for structural UI",
    exempt: [],
  },
  {
    pattern: /\b(?:bg|text)-purple-\d+\b/,
    message: "Use primary or accent tokens instead of purple-* for structural UI",
    exempt: [],
  },
  {
    pattern: /\b(?:bg|text)-sky-\d+\b/,
    message: "Use primary token instead of sky-* for structural UI",
    exempt: [],
  },
  {
    pattern: /\b(?:bg|text)-muted0\b/,
    message: "Use bg-muted or text-muted instead of muted0 (broken token)",
    exempt: [],
  },
  {
    pattern: /shadow-\[.*?rgba\((?!var\(--\w+-rgb\))/,
    message: "Use shadow-sm/shadow-md/shadow-lg or token-based shadows instead of hardcoded rgba",
    exempt: [],
  },
  {
    pattern: /text-\[\d+px\]/,
    message: "Use typography token scale (text-micro, text-label, text-body, etc.) instead of arbitrary pixel sizes",
    exempt: ["components/ui/"],
  },
  {
    pattern: /\b(?:bg|text)-emerald-(?:50|100|200|300|400|500|600|700)(?:\/\d+)?\b/,
    message: "Use <StatusBadge variant=\"emerald\"> instead of inline emerald-* colors",
    exempt: ["components/shared/status-badge.tsx", "components/shared/pulse-status.tsx"],
    skipIf: (line) => /dark:\S*text-emerald/.test(line) || /dark:\S*bg-emerald/.test(line),
  },
  {
    pattern: /\b(?:bg|text)-amber-(?:50|100|200|300|400|500|600|700)(?:\/\d+)?\b/,
    message: "Use <StatusBadge variant=\"amber\"> instead of inline amber-* colors",
    exempt: ["components/shared/status-badge.tsx", "components/shared/pulse-status.tsx"],
    skipIf: (line) => /dark:\S*text-amber/.test(line) || /dark:\S*bg-amber/.test(line),
  },
  {
    pattern: /\b(?:bg|text)-rose-(?:50|100|200|300|400|500|600|700)(?:\/\d+)?\b/,
    message: "Use <StatusBadge variant=\"rose\"> instead of inline rose-* colors",
    exempt: ["components/shared/status-badge.tsx", "components/shared/pulse-status.tsx"],
    skipIf: (line) => /dark:\S*text-rose/.test(line) || /dark:\S*bg-rose/.test(line),
  },
]

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

function isExempt(filePath, rule) {
  const rel = path.relative(ROOT, filePath)
  for (const exempt of rule.exempt) {
    if (rel.includes(exempt)) return true
  }
  if (rel.startsWith("components/ui/") && rule.pattern.source.includes("text-\\[")) {
    return true
  }
  return false
}

let totalErrors = 0
const violations = []

for (const target of TARGET_DIRS) {
  const dir = path.join(ROOT, target)
  if (!fs.existsSync(dir)) continue

  for (const filePath of walk(dir)) {
    const relPath = path.relative(ROOT, filePath)
    const content = fs.readFileSync(filePath, "utf-8")
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      for (const rule of BANNED) {
        if (isExempt(filePath, rule)) continue
        if (rule.skipIf && rule.skipIf(line)) continue
        if (rule.pattern.test(line)) {
          totalErrors++
          violations.push(`${relPath}:${i + 1}: ${rule.message}`)
          break
        }
      }
    }
  }
}

const uniqueViolations = [...new Set(violations)].sort()

console.log(`Design System Guardrail`)
console.log(`=======================\n`)
console.log(`Scanned: ${TARGET_DIRS.join(", ")}/`)
console.log(`Rules: ${BANNED.length}`)
console.log(`Violations: ${uniqueViolations.length}\n`)

if (uniqueViolations.length > 0) {
  for (const v of uniqueViolations.slice(0, 50)) {
    console.log(v)
  }
  if (uniqueViolations.length > 50) {
    console.log(`\n... and ${uniqueViolations.length - 50} more`)
  }
  console.log(`\n${uniqueViolations.length} design system violations found.`)
  process.exit(1)
} else {
  console.log("All clear. No design system violations found.")
  process.exit(0)
}
