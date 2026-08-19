/**
 * Small JSON client for the X API. Authentication belongs to the injected
 * fetch implementation, which is the Interchange mediated credential in
 * production.
 */
import { XAPIError } from "./errors.js";

export { XAPIError } from "./errors.js";

export type XQueryValue = string | number | boolean | undefined | null;

export type XRequest = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Path relative to the X API, e.g. `/2/users/me`. */
  path: string;
  query?: Record<string, XQueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type CreateXClientOptions = {
  fetchImpl: typeof fetch;
};

export type XClient = {
  request(options: XRequest): Promise<unknown>;
};

const X_API_BASE_URL = "https://api.x.com";
const USER_AGENT = "@corbits/x-tools/0.1.0";
const REQUEST_TIMEOUT_MS = 30_000;

function joinUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    throw new Error("X API request path must be relative");
  }
  return `${X_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function applyQuery(
  url: URL,
  query: Record<string, XQueryValue> | undefined,
): void {
  if (query === undefined) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

export function createXClient({ fetchImpl }: CreateXClientOptions): XClient {
  if (typeof fetchImpl !== "function") {
    throw new Error("createXClient: provide fetchImpl");
  }

  async function request(requestOptions: XRequest): Promise<unknown> {
    const url = new URL(joinUrl(requestOptions.path));
    applyQuery(url, requestOptions.query);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
      ...requestOptions.headers,
    };

    let body: string | undefined;
    if (
      requestOptions.body !== undefined &&
      (requestOptions.method === "POST" ||
        requestOptions.method === "PUT" ||
        requestOptions.method === "PATCH")
    ) {
      body = JSON.stringify(requestOptions.body);
      headers["Content-Type"] ??= "application/json";
    }

    let response: Response;
    try {
      response = await fetchImpl(url.toString(), {
        method: requestOptions.method,
        headers,
        body,
        signal:
          requestOptions.signal === undefined
            ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            : AbortSignal.any([
                requestOptions.signal,
                AbortSignal.timeout(REQUEST_TIMEOUT_MS),
              ]),
      });
    } catch (cause) {
      throw new Error(
        `X API request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new XAPIError(response.status, response.statusText, errBody);
    }

    if (response.status === 204) return undefined;

    const raw = await response.text();
    if (raw.length === 0) return undefined;

    try {
      const parsed: unknown = JSON.parse(raw);
      return parsed;
    } catch (cause) {
      const snippet = raw.slice(0, 200).replace(/\s+/g, " ");
      throw new Error(
        `X API request failed: invalid JSON body (status ${String(response.status)}, body starts: ${JSON.stringify(snippet)})`,
        { cause },
      );
    }
  }

  return { request };
}
