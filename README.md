# @corbits/x-tools

X API client and Interchange tools. Auth goes through Interchange credentials
(handle `x-api`). See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Install

```bash
bun add github:corbitsdev/x-tools
# or pin a commit:
bun add github:corbitsdev/x-tools#<sha>
```

Not on npm yet; consume from git or an `npm pack` tarball. The repository root
*is* the package.

## Interchange

```json
"interchange": {
  "tools": "./dist/sidecar-bundle.js",
  "credentials": [{ "handle": "x-api" }]
}
```

Bind `x-api` on the agent definition to a tenant credential whose provider
origin is `https://api.x.com`. The sidecar resolves the mediated http handle
and never takes a raw secret on its options.

## Client

The internal client accepts an injected `fetchImpl`. The sidecar wires the
Interchange mediated credential, so this package never accepts a raw X token.

## Working on it

Requires a sibling checkout of Interchange at `../interchange`. Link its live
packages with `bun run link:intx`.

```bash
bun install
bun run link:intx
bun run typecheck
bun run test
bun run build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

## License

LGPL-2.1-only. See [LICENSE](./LICENSE).
