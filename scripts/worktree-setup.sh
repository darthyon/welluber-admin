#!/usr/bin/env bash
#
# Bootstrap a fresh git worktree so it runs like the main checkout.
#
# A new worktree starts with no node_modules and no .env.local (it's gitignored,
# so it never travels with the branch). Run this once after creating a worktree:
#
#   pnpm setup:worktree
#
set -euo pipefail

# Main working tree = the first entry of `git worktree list`.
MAIN="$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')"
HERE="$(git rev-parse --show-toplevel)"

if [ "$MAIN" = "$HERE" ]; then
  echo "This is the main worktree — nothing to bootstrap."
  exit 0
fi

# 1. Local env (gitignored) — copy from main if we don't already have it.
if [ -f "$HERE/.env.local" ]; then
  echo "• .env.local already present"
elif [ -f "$MAIN/.env.local" ]; then
  cp "$MAIN/.env.local" "$HERE/.env.local"
  echo "✓ copied .env.local from main"
else
  echo "• no .env.local in main — skipping (app runs in no-auth stub mode)"
fi

# 2. Dependencies.
if [ -d "$HERE/node_modules" ]; then
  echo "• node_modules already present"
else
  echo "Installing dependencies…"
  pnpm install
fi

echo "Done. Start the dev server with: pnpm dev"
