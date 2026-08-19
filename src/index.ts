// @corbits/x-tools — X API client and Interchange tools. See ARCHITECTURE.md.

export {
  createXClient,
  XAPIError,
} from "./client/index.js";
export type {
  XClient,
  CreateXClientOptions,
  XRequest,
  XQueryValue,
} from "./client/index.js";

export {
  X_CREDENTIAL_HANDLE,
  TOOL_DEFINITIONS,
  USER_LOOKUP_FIELDS,
  createXTools,
} from "./tools/index.js";
export type {
  CreateXToolsOptions,
  XTools,
} from "./tools/index.js";
