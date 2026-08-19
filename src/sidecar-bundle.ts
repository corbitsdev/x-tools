/**
 * Sidecar-bundle entry for `@corbits/x-tools` — the factory the Interchange
 * tool-package loader invokes.
 *
 * Declares credential handle `x-api` (see package.json `interchange.credentials`).
 * At run, resolves that handle from `env.capabilities` into an http mediated
 * credential and dispatches the package tool definitions against it.
 */
import { defineTool, type BaseEnv } from "@intx/agent";
import type { RuntimeCapabilities } from "@intx/types/runtime-capabilities";

import { createXTools } from "./tools/create-tools.js";
import { TOOL_DEFINITIONS } from "./tools/definitions.js";

export interface XToolEnv extends BaseEnv {
  capabilities: RuntimeCapabilities;
}

/** Named export the loader picks up. */
export const x = defineTool<XToolEnv>({
  id: "@corbits/x-tools/sidecar-bundle",
  requires: ["capabilities"],
  definitions: TOOL_DEFINITIONS.map((def) => ({ name: def.name })),
  factory: (env) => {
    const tools = createXTools({ capabilities: env.capabilities });
    return {
      definitions: tools.definitions,
      run: (call, signal) => tools.run(call, signal),
      dispose: () => tools.dispose(),
    };
  },
});
