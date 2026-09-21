# @corbits/x-tools — Product

Interchange tools for X (Twitter): a grantable package hosts will eventually give agents so they can act on X without ad-hoc scripts.

This document is intent and scope. It is not a tool catalog. The shipped export surface is in `README.md`.

## Current shipped state

`@corbits/x-tools` is a package shell. On `main`:

- There are **no named tool exports**.
- `index.ts` is the Bun scaffold (it logs on load). It is not a tool API.
- There is no `exports` map. `package.json` points `module` at `index.ts`. Bun can load that source; native Node does not load it as a published library.
- Node `>= 24` is the engines floor. License is LGPL-2.1-only.

Do not grant this package to an agent until a real tool export exists.

Unmerged work on other branches or forks is not product. Do not treat it as shipped.

## Why it exists

Agents that need X still have no first-party Interchange package to import and grant. This repository holds the package identity (`@corbits/x-tools`) so that work has a place to land.

## Target users

- Interchange host operators who will grant X tools to agents
- Developers who will add those tools to this package

There is nothing for an end user or an agent to do with the package today beyond a side-effect import.

## Goals

1. Keep a single, grantable package name for X tools.
2. Ship a tool API only when it exists on the public export surface — not as documentation fiction.
3. Stay honest: README and this file describe the tree as it is, not a fork PR.

## Out of scope (now)

- Named tool functions, handlers, or example calls
- An Interchange sidecar bundle
- X API credentials, clients, or wire formats
- Architecture of unmerged proposals

When a tool export lands on the branch this document tracks, update this file and `README.md` together. Until then, `ARCHITECTURE.md` and `IMPLEMENTATION.md` stay absent rather than invent a design.
