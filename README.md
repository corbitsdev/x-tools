# @corbits/x-tools

Interchange tools for X (Twitter). The package name is `@corbits/x-tools`; Node >= 24 is the engines floor. `main` has no named tool exports — `index.ts` is the Bun scaffold, not a tool API. Product intent is in `PRODUCT.md`; this README is the shipped surface only.

## Runtime support

Node >= 24 is the engines floor. There is no `exports` map; `package.json` points `module` at `index.ts`. Bun can load that source. Native Node does not load it as a published library.

## Quickstart

```sh
npm add @corbits/x-tools
pnpm add @corbits/x-tools
yarn add @corbits/x-tools
bun add @corbits/x-tools
```

Side-effect import from the package name. There is no named tool export on this branch.

```ts
import "@corbits/x-tools";
```

`index.ts` logs on load. Wait for a tool export before granting this package to an agent.

## How it works

This repository is the X tools package shell: license LGPL-2.1-only, Node 24 floor, Bun + TypeScript. Tool handlers and an Interchange sidecar bundle land in follow-up work, not on this README.

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
