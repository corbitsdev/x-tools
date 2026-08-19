# @corbits/x-tools

Interchange tools for X (Twitter). The package name is `@corbits/x-tools`; Node >= 24 is the engines floor. This README documents the shipped surface only, not product intent.

## Runtime support

Node >= 24 is the engines floor. Bun loads `src/index.ts` directly via the `bun` export condition; Node consumers get the compiled `dist` output.

## Quickstart

```sh
npm add @corbits/x-tools
pnpm add @corbits/x-tools
yarn add @corbits/x-tools
bun add @corbits/x-tools
```

Not on npm yet; consume from git (`bun add github:corbitsdev/x-tools`, ideally
pinned to a commit) or an `npm pack` tarball until it's published.

`createXTools` builds an `XTools` tool runner backed by two tool
definitions: `getUsersMe` (`GET /2/users/me`) and `getUsersByUsername`
(`GET /2/users/by/username/:username`). `x`, exported from
`@corbits/x-tools/sidecar-bundle`, is the Interchange sidecar entry that
wraps the same tools for the tool-package loader.

## How it works

Auth goes through Interchange credentials (handle `x-api`, declared in
`package.json`'s `interchange.credentials`). At run, the sidecar resolves
that handle from `RuntimeCapabilities` into an http mediated credential and
hands its `fetch` to `createXClient`, so this package never accepts a raw X
token. `createXClient` is a small JSON client for `https://api.x.com` with
request timeout, cancellation, and `XAPIError` for non-2xx responses. See
[ARCHITECTURE.md](./ARCHITECTURE.md) for more detail.

## Development

```sh
git clone https://github.com/corbitsdev/x-tools.git
cd x-tools
bun install
bun run link:intx
bun run typecheck
bun run test
bun run build
```

`bun run link:intx` links a sibling Interchange checkout at `../interchange`;
it's required before `typecheck`, `test`, or `build` since `@intx/agent` and
`@intx/types` aren't published yet. See [CONTRIBUTING.md](./CONTRIBUTING.md)
and [ARCHITECTURE.md](./ARCHITECTURE.md).

## License

LGPL-2.1-only. See [LICENSE](./LICENSE).
