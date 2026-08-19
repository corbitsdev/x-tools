import type { ToolDefinition } from "@intx/types/runtime";

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "getUsersMe",
    description:
      "Fetch the authenticated X user (GET /2/users/me). Uses the mediated X credential.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "getUsersByUsername",
    description:
      "Look up an X user by username (GET /2/users/by/username/:username).",
    inputSchema: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "X username without the @ prefix",
        },
      },
      required: ["username"],
      additionalProperties: false,
    },
  },
];

export const X_CREDENTIAL_HANDLE = "x-api";
