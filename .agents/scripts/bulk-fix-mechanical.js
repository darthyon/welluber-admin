#!/usr/bin/env node
/**
 * Bulk mechanical design system fixes — conservative pass
 * Only applies safe, context-free replacements.
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "../..")

const files = fs.readFileSync("/tmp/violating-files.txt", "utf-8")
  .split("\n")
  .filter(Boolean)

let modified = 0

for (const relPath of files) {
  const filePath = path.join(ROOT, relPath)
  if (!fs.existsSync(filePath)) continue

  let content = fs.readFileSync(filePath, "utf-8")
  let original = content
  let changed = false

  // 1. bg-white → bg-background (conservative: not in welluber logo/mark)
  if (!relPath.includes("welluber-logo") && !relPath.includes("welluber-mark")) {
    const next = content.replace(/\bbg-white\b(?!\/[0-9])/g, "bg-background")
    if (next !== content) { content = next; changed = true; }
  }

  // 2. text-white → text-primary-foreground (conservative)
  if (!relPath.includes("welluber-logo") && !relPath.includes("welluber-mark")) {
    const next = content.replace(/\btext-white\b(?!\/[0-9])/g, "text-primary-foreground")
    if (next !== content) { content = next; changed = true; }
  }

  // 3. zinc-* structural → tokens
  {
    const next = content
      .replace(/\bborder-zinc-\d+\b/g, "border-border")
      .replace(/\bbg-zinc-\d+\b/g, "bg-muted")
      .replace(/\btext-zinc-\d+\b/g, "text-muted-foreground")
    if (next !== content) { content = next; changed = true; }
  }

  // 4. slate-* structural → tokens
  {
    const next = content
      .replace(/\bborder-slate-\d+\b/g, "border-border")
      .replace(/\bbg-slate-\d+\b/g, "bg-muted")
      .replace(/\btext-slate-\d+\b/g, "text-muted-foreground")
    if (next !== content) { content = next; changed = true; }
  }

  // 5. red-500/600 structural → destructive (only when not semantic status)
  // Skip files that are clearly status components
  if (!relPath.includes("pulse-status") && !relPath.includes("status-badge")) {
    const next = content
      .replace(/\bbg-red-500\b/g, "bg-destructive")
      .replace(/\btext-red-500\b/g, "text-destructive")
      .replace(/\bbg-red-600\b/g, "bg-destructive")
      .replace(/\btext-red-600\b/g, "text-destructive")
    if (next !== content) { content = next; changed = true; }
  }

  // 6. Hardcoded shadow-[...rgba(...)] → standard shadows
  {
    const next = content
      .replace(/shadow-\[0_20px_50px_rgba\(0,0,0,0\.15\)\]/g, "shadow-lg")
      .replace(/shadow-\[0_25px_50px_-12px_rgb\(0_0_0_\/_(0\.5|0\.25|0\.1)\)\]/g, "shadow-xl")
      .replace(/shadow-\[0_4px_20px_rgba\(0,0,0,0\.08\)\]/g, "shadow-md")
      .replace(/shadow-\[0_2px_8px_rgba\(0,0,0,0\.04\)\]/g, "shadow-sm")
      .replace(/shadow-\[0_10px_40px_rgba\(0,0,0,0\.12\)\]/g, "shadow-lg")
      .replace(/shadow-\[0_0_0_1px_rgba\(0,0,0,0\.05\)\]/g, "shadow-sm")
      .replace(/shadow-\[inset_0_0_0_1px_rgba\(0,0,0,0\.05\)\]/g, "shadow-inner")
      .replace(/shadow-\[0_4px_12px_rgba\(0,0,0,0\.1\)\]/g, "shadow-md")
      .replace(/shadow-\[0_8px_30px_rgba\(0,0,0,0\.12\)\]/g, "shadow-lg")
    if (next !== content) { content = next; changed = true; }
  }

  // 7. arbitrary text-[...px] → token scale (only exact pixel values)
  {
    const next = content
      .replace(/\btext-\[8px\]\b/g, "text-micro")
      .replace(/\btext-\[9px\]\b/g, "text-micro")
      .replace(/\btext-\[10px\]\b/g, "text-micro")
      .replace(/\btext-\[11px\]\b/g, "text-label")
      .replace(/\btext-\[12px\]\b/g, "text-label")
      .replace(/\btext-\[13px\]\b/g, "text-body")
      .replace(/\btext-\[13\.5px\]\b/g, "text-body")
      .replace(/\btext-\[14px\]\b/g, "text-body")
      .replace(/\btext-\[15px\]\b/g, "text-lead")
      .replace(/\btext-\[16px\]\b/g, "text-lead")
      .replace(/\btext-\[18px\]\b/g, "text-heading")
      .replace(/\btext-\[20px\]\b/g, "text-heading")
      .replace(/\btext-\[24px\]\b/g, "text-title")
      .replace(/\btext-\[32px\]\b/g, "text-display")
    if (next !== content) { content = next; changed = true; }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf-8")
    modified++
    console.log(`✓ ${relPath}`)
  }
}

console.log(`\n${modified} files modified.`)
