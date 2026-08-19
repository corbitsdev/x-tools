import { describe, expect, test } from "bun:test";

import { createXClient, XAPIError } from "./client.js";

describe("createXClient", () => {
  test("requires an injected fetch implementation", () => {
    expect(() => createXClient({} as never)).toThrow(/fetchImpl/);
  });

  test("GETs a relative path without adding credentials", async () => {
    const fetchImpl = (async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      expect(String(input)).toBe("https://api.x.com/2/users/me");
      expect(init?.method).toBe("GET");
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
      expect(headers.Accept).toBe("application/json");
      return new Response(JSON.stringify({ data: { id: "1", name: "Ada" } }), {
        status: 200,
      });
    }) as unknown as typeof fetch;

    const client = createXClient({ fetchImpl });
    const body = await client.request({ method: "GET", path: "/2/users/me" });
    expect(body).toEqual({ data: { id: "1", name: "Ada" } });
  });

  test("applies query params and skips nullish values", async () => {
    const fetchImpl = (async (input: string | URL | Request) => {
      const url = new URL(String(input));
      expect(url.pathname).toBe("/2/users/me");
      expect(url.searchParams.get("user.fields")).toBe("username");
      expect(url.searchParams.has("cursor")).toBe(false);
      return new Response(JSON.stringify({ data: { id: "1" } }), {
        status: 200,
      });
    }) as unknown as typeof fetch;

    const client = createXClient({ fetchImpl });
    await client.request({
      method: "GET",
      path: "/2/users/me",
      query: {
        "user.fields": "username",
        cursor: undefined,
        next: null,
      },
    });
  });

  test("POSTs JSON bodies with Content-Type", async () => {
    const fetchImpl = (async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      expect(String(input)).toBe("https://api.x.com/2/tweets");
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify({ text: "hello" }));
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      return new Response(JSON.stringify({ data: { id: "t1" } }), {
        status: 201,
      });
    }) as unknown as typeof fetch;

    const client = createXClient({ fetchImpl });
    const body = await client.request({
      method: "POST",
      path: "/2/tweets",
      body: { text: "hello" },
    });
    expect(body).toEqual({ data: { id: "t1" } });
  });

  test("rejects absolute request paths", async () => {
    const fetchImpl = (async () =>
      new Response("{}", { status: 200 })) as unknown as typeof fetch;
    const client = createXClient({ fetchImpl });

    await expect(
      client.request({
        method: "GET",
        path: "https://upload.example/1.1/media/upload.json",
      }),
    ).rejects.toThrow(/path must be relative/);
  });

  test("passes the caller abort signal to fetch", async () => {
    const controller = new AbortController();
    let observedSignal: AbortSignal | undefined;
    const fetchImpl = (async (
      _input: string | URL | Request,
      init?: RequestInit,
    ) => {
      observedSignal = init?.signal ?? undefined;
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch;

    const client = createXClient({ fetchImpl });
    await client.request({
      method: "GET",
      path: "/2/users/me",
      signal: controller.signal,
    });
    expect(observedSignal).toBeDefined();
    expect(observedSignal?.aborted).toBe(false);
  });

  test("returns undefined for 204 and empty bodies", async () => {
    const fetchImpl = (async () =>
      new Response(null, { status: 204 })) as unknown as typeof fetch;
    const client = createXClient({ fetchImpl });

    await expect(
      client.request({ method: "DELETE", path: "/2/tweets/1" }),
    ).resolves.toBeUndefined();
  });

  test("surfaces non-2xx responses as XAPIError with status and body", async () => {
    const fetchImpl = (async () =>
      new Response('{"detail":"unauthorized"}', {
        status: 401,
        statusText: "Unauthorized",
      })) as unknown as typeof fetch;
    const client = createXClient({ fetchImpl });

    await expect(
      client.request({ method: "GET", path: "/2/users/me" }),
    ).rejects.toThrow(XAPIError);
    try {
      await client.request({ method: "GET", path: "/2/users/me" });
      throw new Error("expected request to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(XAPIError);
      const apiErr = err as XAPIError;
      expect(apiErr.status).toBe(401);
      expect(apiErr.body).toBe('{"detail":"unauthorized"}');
    }
  });

  test("rejects invalid JSON on a 2xx response", async () => {
    const fetchImpl = (async () =>
      new Response("not-json", { status: 200 })) as unknown as typeof fetch;
    const client = createXClient({ fetchImpl });

    await expect(
      client.request({ method: "GET", path: "/2/users/me" }),
    ).rejects.toThrow(/invalid JSON/);
  });
});
