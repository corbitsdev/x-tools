# AGENTS.md

Instructions for AI agents working in this repository.

## Overview

**Corbits Tools for X** (`@corbits/x-tools`) — X API client and Interchange
tools (credential handle `x-api`). See ARCHITECTURE.md.

## Conventions

- **Runtime:** Bun + TypeScript, ES modules only.
- Touch only code related to the task.
- Comment *why*, never *what*.
- No emojis in code or docs.
- Package never reads `process.env` — hosts pass options explicitly.
- Tool names match X MCP / xmcp names as-is.
- Field defaults mirror xurl shortcuts unless the caller overrides.

## Build & Validation

```bash
bun install
bun run link:intx
bun run typecheck
bun test
bun run build
```
