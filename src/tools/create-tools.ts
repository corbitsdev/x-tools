import type { ToolHandler } from "@intx/agent";
import type {
  ToolCall,
  ToolDefinition,
  ToolResult,
  ToolRunner,
} from "@intx/types/runtime";
import type { HttpMediatedCredential } from "@intx/types";
import type { RuntimeCapabilities } from "@intx/types/runtime-capabilities";

import {
  createXClient,
  type XClient,
} from "../client/index.js";
import {
  TOOL_DEFINITIONS,
  X_CREDENTIAL_HANDLE,
} from "./definitions.js";
import {
  makeGetUsersByUsernameHandler,
  makeGetUsersMeHandler,
} from "./users.js";

export type CreateXToolsOptions = {
  capabilities: RuntimeCapabilities;
};

export interface XTools extends ToolRunner {
  readonly definitions: ToolDefinition[];
  dispose(): Promise<void>;
}

type ToolHandlerFactory = (client: XClient) => ToolHandler;

const HANDLER_FACTORIES: ReadonlyMap<string, ToolHandlerFactory> = new Map([
  ["getUsersMe", makeGetUsersMeHandler],
  ["getUsersByUsername", makeGetUsersByUsernameHandler],
]);

export function createXTools(opts: CreateXToolsOptions): XTools {
  assertCatalogMatchesHandlers();
  let clientPromise: Promise<XClient> | undefined;
  let handlersPromise: Promise<ReadonlyMap<string, ToolHandler>> | undefined;
  let mediated: HttpMediatedCredential | undefined;
  let disposed = false;

  async function getClient(): Promise<XClient> {
    clientPromise ??= (async () => {
      const credentials = opts.capabilities.resolve("credentials");
      const resolved = await credentials.resolve(X_CREDENTIAL_HANDLE);
      if (resolved.kind !== "http") {
        throw new Error(
          `x-tools: expected http mediated credential for handle "${X_CREDENTIAL_HANDLE}", got ${resolved.kind}`,
        );
      }
      mediated = resolved;
      return createXClient({
        fetchImpl: ((input, init) =>
          resolved.fetch(input, init)) as typeof fetch,
      });
    })();
    return clientPromise;
  }

  async function getHandlers(): Promise<ReadonlyMap<string, ToolHandler>> {
    handlersPromise ??= getClient().then((client) =>
      new Map(
        [...HANDLER_FACTORIES].map(([name, factory]) => [
          name,
          factory(client),
        ]),
      ),
    );
    return handlersPromise;
  }

  return {
    definitions: TOOL_DEFINITIONS,
    async run(call: ToolCall, signal: AbortSignal): Promise<ToolResult> {
      if (!HANDLER_FACTORIES.has(call.name)) {
        return {
          callId: call.id,
          content: { error: `Unknown tool: "${call.name}"` },
          isError: true,
        };
      }

      try {
        const handler = (await getHandlers()).get(call.name);
        if (handler === undefined) {
          throw new Error(`Tool handler not registered: "${call.name}"`);
        }
        return await handler(call, signal);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : `unknown error: ${String(err)}`;
        return {
          callId: call.id,
          content: { error: message },
          isError: true,
        };
      }
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      if (clientPromise !== undefined) {
        await clientPromise.catch(() => undefined);
      }
      await mediated?.dispose();
    },
  };
}

function assertCatalogMatchesHandlers(): void {
  const definitionNames = TOOL_DEFINITIONS.map((definition) => definition.name).sort();
  const handlerNames = [...HANDLER_FACTORIES.keys()].sort();
  if (JSON.stringify(definitionNames) !== JSON.stringify(handlerNames)) {
    throw new Error(
      `x-tools: definitions and handlers differ (${definitionNames.join(", ")} vs ${handlerNames.join(", ")})`,
    );
  }
}
