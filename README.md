# @corbits/x-tools

Interchange tools for X (Twitter). The published package name is `@corbits/x-tools`; Node >= 24 is the engines floor. The public tool surface is not on `main` yet — `index.ts` is the Bun scaffold, not a tool export.

## Install

```sh
npm add @corbits/x-tools
pnpm add @corbits/x-tools
yarn add @corbits/x-tools
bun add @corbits/x-tools
```

## Use

Import from the package name in `package.json`. There is no `exports` map and no named tool API on this branch.

```ts
import "@corbits/x-tools";
```

## Full example

The current module is the Bun starter (`index.ts` logs on load). Consumers should wait for a tool export before granting this package to an agent.

```ts
// package.json: { "name": "@corbits/x-tools", "module": "index.ts" }
import pkg from "./package.json" with { type: "json" };

console.log(pkg.name);
```

## How it works

This repository is the X tools package shell: license LGPL-2.1-only, Node 24 floor, Bun + TypeScript. Tool handlers and an Interchange sidecar bundle land in follow-up work, not on this README.

## Contributing

```sh
bun install
bun run typecheck
bun run test
```

`bun run test` is `node --test smoke.test.mjs` (engines floor).

## License

LGPL-2.1-only.
