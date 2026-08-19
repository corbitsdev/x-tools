import { describe, expect, test } from "bun:test";
import { createRuntimeCapabilities } from "@intx/types/runtime-capabilities";

import { x, type XToolEnv } from "./sidecar-bundle.js";
import { TOOL_DEFINITIONS } from "./tools/definitions.js";

describe("sidecar-bundle", () => {
  test("declares the same tool names as the package catalog", () => {
    expect(x.definitions.map((definition) => definition.name)).toEqual(
      TOOL_DEFINITIONS.map((definition) => definition.name),
    );
  });

  test("creates a runnable bundle through the defineTool boundary", async () => {
    const fetchImpl = (async () =>
      new Response(JSON.stringify({ data: { id: "42" } }), { status: 200 })) as unknown as typeof fetch;
    const capabilities = createRuntimeCapabilities({
      credentials: {
        resolve: async () => ({
          kind: "http" as const,
          fetch: fetchImpl,
          dispose() {},
        }),
      },
    });

    // The sidecar factory only reads capabilities; the host supplies the rest of BaseEnv.
    const bundle = x({ capabilities } as XToolEnv);
    const result = await bundle.run(
      { id: "call-1", name: "getUsersMe", arguments: {} },
      new AbortController().signal,
    );

    expect(result.content).toEqual({ data: { id: "42" } });
    await bundle.dispose?.();
  });
});
