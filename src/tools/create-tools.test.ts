import { describe, expect, test } from "bun:test";

import { createRuntimeCapabilities } from "@intx/types/runtime-capabilities";

import { createXTools } from "./create-tools.js";
import { TOOL_DEFINITIONS, X_CREDENTIAL_HANDLE } from "./definitions.js";

function createTestCapabilities(opts: {
  fetchImpl: typeof fetch;
  handle?: string;
}) {
  const handle = opts.handle ?? X_CREDENTIAL_HANDLE;
  return createRuntimeCapabilities({
    credentials: {
      async resolve(requested) {
        if (requested !== handle) {
          throw new Error(`unbound credential handle: ${requested}`);
        }
        return {
          kind: "http" as const,
          fetch: opts.fetchImpl,
          dispose() {},
        };
      },
    },
  });
}

describe("TOOL_DEFINITIONS", () => {
  test("declares the users-domain tools", () => {
    expect(TOOL_DEFINITIONS.map((tool) => tool.name).sort()).toEqual([
      "getUsersByUsername",
      "getUsersMe",
    ]);
  });
});

describe("createXTools", () => {
  test("runs getUsersMe through the mediated credential", async () => {
    const fetchImpl = (async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      const url = new URL(String(input));
      expect(url.origin + url.pathname).toBe("https://api.x.com/2/users/me");
      expect(url.searchParams.get("user.fields")).toContain("public_metrics");
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
      return new Response(
        JSON.stringify({ data: { id: "42", username: "ada" } }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;

    const tools = createXTools({
      capabilities: createTestCapabilities({ fetchImpl }),
    });
    const result = await tools.run(
      { id: "call-1", name: "getUsersMe", arguments: {} },
      new AbortController().signal,
    );

    expect(result).toEqual({
      callId: "call-1",
      content: { data: { id: "42", username: "ada" } },
    });
    await tools.dispose();
  });

  test("looks up a username with the expected fields and URL encoding", async () => {
    const fetchImpl = (async (input: string | URL | Request) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/2/users/by/username/ada%20lovelace");
      expect(url.searchParams.get("user.fields")).toContain("public_metrics");
      return new Response(JSON.stringify({ data: { id: "42" } }), { status: 200 });
    }) as unknown as typeof fetch;

    const tools = createXTools({
      capabilities: createTestCapabilities({ fetchImpl }),
    });
    const result = await tools.run(
      {
        id: "call-2",
        name: "getUsersByUsername",
        arguments: { username: "@ada lovelace" },
      },
      new AbortController().signal,
    );

    expect(result.content).toEqual({ data: { id: "42" } });
    await tools.dispose();
  });

  test("returns a validation error for an empty username", async () => {
    const fetchImpl = (async () => {
      throw new Error("fetch should not run");
    }) as unknown as typeof fetch;
    const tools = createXTools({
      capabilities: createTestCapabilities({ fetchImpl }),
    });

    const result = await tools.run(
      {
        id: "call-3",
        name: "getUsersByUsername",
        arguments: { username: "@" },
      },
      new AbortController().signal,
    );

    expect(result.isError).toBe(true);
    expect(result.content).toEqual({
      error: 'argument "username" must not be empty',
    });
    await tools.dispose();
  });

  test("returns isError for unknown tool names", async () => {
    const tools = createXTools({
      capabilities: createTestCapabilities({
        fetchImpl: (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch,
      }),
    });

    const result = await tools.run(
      { id: "call-4", name: "nope", arguments: {} },
      new AbortController().signal,
    );
    expect(result).toEqual({
      callId: "call-4",
      content: { error: 'Unknown tool: "nope"' },
      isError: true,
    });
  });

  test("fails closed when the credential handle is unbound", async () => {
    const tools = createXTools({
      capabilities: createTestCapabilities({
        handle: "other-handle",
        fetchImpl: (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch,
      }),
    });

    const result = await tools.run(
      { id: "call-5", name: "getUsersMe", arguments: {} },
      new AbortController().signal,
    );
    expect(result.isError).toBe(true);
    expect(String((result.content as { error: string }).error)).toContain(
      X_CREDENTIAL_HANDLE,
    );
  });
});
