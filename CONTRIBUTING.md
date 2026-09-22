# Contributing

A small, deliberately boring codebase: strict TypeScript, no magic.

Setup and commands are in the [README](./README.md#development). `bun run
typecheck` must be clean — it is its own CI step, and `any` is not a way past it.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the delivery plan and non-goals.

## Tests

- **Red first.** A bug fix starts with a test that fails for the reason you believe,
  and you should watch it fail.
- Assert **behavior a consumer can observe** over internal call shapes.
- Colocate tests next to the code they cover (`*.test.ts`).

## Pull requests

- Keep commits focused, and keep the diff to the change you are describing.
- Explain *why* in the commit message; the code already says what.
- CI must be green: typecheck, test, and build.
- Contributions are accepted under the repository's LGPL-2.1-only licence.
