import type { ToolHandler } from "@intx/agent";
import type { ToolResult } from "@intx/types/runtime";

import type { XClient } from "../client/index.js";

export const USER_LOOKUP_FIELDS =
  "created_at,description,public_metrics,verified,verified_type,subscription_type,profile_image_url";

export function makeGetUsersMeHandler(client: XClient): ToolHandler {
  return async (call, signal): Promise<ToolResult> => ({
    callId: call.id,
    content: toToolContent(
      await client.request({
        method: "GET",
        path: "/2/users/me",
        query: { "user.fields": USER_LOOKUP_FIELDS },
        signal,
      }),
    ),
  });
}

export function makeGetUsersByUsernameHandler(client: XClient): ToolHandler {
  return async (call, signal): Promise<ToolResult> => {
    const username = getUsername(call.arguments);
    return {
      callId: call.id,
      content: toToolContent(
        await client.request({
          method: "GET",
          path: `/2/users/by/username/${encodeURIComponent(username)}`,
          query: { "user.fields": USER_LOOKUP_FIELDS },
          signal,
        }),
      ),
    };
  };
}

function getUsername(args: Record<string, unknown>): string {
  const value = args["username"];
  if (typeof value !== "string") {
    throw new Error('argument "username" must be a string');
  }

  const username = value.trim().replace(/^@/, "");
  if (username.length === 0) {
    throw new Error('argument "username" must not be empty');
  }
  return username;
}

function toToolContent(value: unknown): ToolResult["content"] {
  if (typeof value === "string" || isRecord(value)) return value;
  return { result: value };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
