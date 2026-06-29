# WellUber Admin — Claude Code Instructions

Read `AGENTS.md` first. It is the single source of truth for stack, design system,
shared components, constraints, and verification commands.

This file adds Claude Code–specific guidance only.

## Memory

Project memory lives in `.claude/projects/…/memory/`. Check it for context on
prior decisions before starting new work.

## Codebase Memory Scout Workflow

Use `codebase-memory-mcp` first for structural repo discovery: locating files,
components, routes, hooks, stores, utilities, data sources, callers,
dependencies, impact, architecture, and the smallest safe patch scope.

Default workflow:
1. Scout with `codebase-memory-mcp`.
2. Return the MCP tool/query used, smallest relevant file set, why each file matters, and a minimal patch plan.
3. Wait for approval before editing.
4. Read only the relevant snippets from approved files.
5. Patch only the approved scope.
6. Run targeted verification.
7. Summarize changed files, diff intent, and verification result.

Fallback rules:
- If MCP is unavailable, say so before using `grep`, `rg`, `find`, or file reads.
- If the repo is not indexed, ask to index or use the CLI/index tool before falling back.
- If MCP results are irrelevant, incomplete, or stale, explain why and then use targeted rg or file reads.
- For exact string searches, CSS classes, copy text, config keys, error messages, or build logs, targeted rg is allowed after stating why MCP is not the right tool.

Hard rules:
- Do not edit during scouting.
- Do not read broad files unless MCP is insufficient.
- Do not paste full files in responses.
- Do not refactor unrelated code or make "while I'm here" changes.
- Never rely on MCP alone for final proof; inspect relevant snippets and run targeted verification when applicable.
