# Architecture

## What this package is

`@corbits/x-tools` is an X API client plus an Interchange tool package. Tools
authenticate through Interchange's **mediated credential** rail — the secret
never appears on the tool options API.

## Interchange credentials

Declared in `package.json`:

```json
"interchange": {
  "tools": "./dist/sidecar-bundle.js",
  "credentials": [{ "handle": "x-api" }]
}
```

At runtime the sidecar factory (`src/sidecar-bundle.ts`):

1. Receives `env.capabilities` from the host (`requires: ["capabilities"]`)
2. Builds a tool runner with the capabilities
3. On the first tool call, resolves `credentials` → handle `x-api` → http
   mediated credential and caches the client
4. Uses `createXClient({ fetchImpl: mediated.fetch })` — Bearer is injected by
   Interchange per request, pinned to the provider origin (`https://api.x.com`)

Agent definitions bind the handle:

```ts
credentialBindings: [{
  package: "@corbits/x-tools",
  handle: "x-api",
  provider: "x",       // tenant provider whose origin is https://api.x.com
  locator: "tenant",
}]
```

See Interchange `docs/CREDENTIALS.md` and the credential-probe e2e fixture.

The client accepts only an injected `fetchImpl`; production passes the mediated
credential's fetch and tests provide a stub.

## Layout

```
src/
  client/            # createXClient, XAPIError
  tools/             # definitions, domain handlers, createXTools
  sidecar-bundle.ts  # defineTool export for the Interchange loader
  index.ts
```

Depends on a sibling `../interchange` checkout. Run `bun run link:intx` to
symlink its packages so we track live `intx-src` — not the stale npm `0.2.2`
cut.
## Tool delivery plan (v1)

1. Users → 2. Posts → 3. Search → 4. Bookmarks → 5. Media → 6. News / Trends

## Phase 2 (deferred)

Lists, DMs, Spaces, Communities, Community Notes, Articles, XChat, compliance /
Account Activity webhooks.
