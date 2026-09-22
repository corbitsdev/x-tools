# @corbits/x-tools

Interchange tools for X (Twitter). The package name is `@corbits/x-tools`; Node >= 24 is the engines floor. `index.ts` is the Bun entry point. Product intent is in `PRODUCT.md`; this README is the shipped surface only.

## Runtime support

Node >= 24 is the engines floor. `package.json` points `module` at `index.ts`. Bun loads that source directly.

## Quickstart

```sh
npm add @corbits/x-tools
pnpm add @corbits/x-tools
yarn add @corbits/x-tools
bun add @corbits/x-tools
```

There are no named tool exports on this branch — `index.ts` is the Bun entry point, not a tool API. Grant this package to an agent once a tool export is available.

## How it works

This repository is the X tools package shell: license LGPL-2.1-only, Node 24 floor, Bun + TypeScript. Tool handlers and an Interchange sidecar bundle land in follow-up work.

## Development

```sh
git clone https://github.com/corbitsdev/x-tools.git
cd x-tools
bun install
bun run typecheck
bun run test
```

`bun run test` is `node --test smoke.test.mjs` (engines floor).

## License

LGPL-2.1-only.
