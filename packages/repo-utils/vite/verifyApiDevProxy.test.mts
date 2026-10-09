import { once } from "node:events";
import http from "node:http";
import type { AddressInfo } from "node:net";

import { describe, expect, it } from "vitest";

import {
  createVerifyApiProxyMiddleware,
  type VerifyApiProxyDispatch,
  type VerifyApiProxyEnv,
  type VerifyApiProxyTarget,
} from "./verifyApiDevProxy.mts";

describe("verify API dev proxy middleware", () => {
  it("forwards /api/v3/verify to VERIFY_API_URL and injects VERIFY_API_KEY", async () => {
    for (const verifyApiUrl of ["https://verify.example.com", "https://verify.example.com/api/v3/verify"]) {
      const forwarded: Forwarded[] = [];

      await withProxy(
        {
          VERIFY_API_URL: verifyApiUrl,
          VERIFY_API_KEY: "default-key",
        },
        recordingDispatch(forwarded),
        async (baseUrl) => {
          const preflight = await fetch(`${baseUrl}/api/v3/verify`, {
            method: "OPTIONS",
            headers: { Origin: "https://localhost:3000" },
          });
          expect(preflight.status).toBe(204);
          expect(forwarded).toEqual([]);

          const response = await fetch(`${baseUrl}/api/v3/verify`, {
            method: "POST",
            headers: {
              Origin: "https://localhost:3000",
              Authorization: "browser-key",
              "Content-Type": "application/json",
            },
            body: "{}",
          });

          expect(response.status).toBe(200);
          expect(response.headers.get("access-control-allow-origin")).toBe("https://localhost:3000");
          expect(forwarded).toEqual([
            {
              hostname: "verify.example.com",
              path: "/api/v3/verify",
              method: "POST",
              authorization: "default-key",
            },
          ]);
        },
      );
    }
  });

  it("omits Authorization on /api/v3/verify when VERIFY_API_KEY is empty", async () => {
    const forwarded: Forwarded[] = [];

    await withProxy(
      { VERIFY_API_URL: "https://verify.example.com/api/v3", VERIFY_API_KEY: "  " },
      recordingDispatch(forwarded),
      async (baseUrl) => {
        await fetch(`${baseUrl}/api/v3/verify`, {
          method: "POST",
          headers: { Authorization: "browser-key" },
          body: "{}",
        });

        expect(forwarded).toEqual([
          {
            hostname: "verify.example.com",
            path: "/api/v3/verify",
            method: "POST",
            authorization: undefined,
          },
        ]);
      },
    );
  });

  it("returns 404 when VERIFY_API_URL is unset", async () => {
    let dispatched = false;

    await withProxy(
      {},
      (_target, _req, res) => {
        dispatched = true;
        res.statusCode = 200;
        res.end();
      },
      async (baseUrl) => {
        const preflight = await fetch(`${baseUrl}/api/v3/verify`, { method: "OPTIONS" });
        expect(preflight.status).toBe(204);

        const response = await fetch(`${baseUrl}/api/v3/verify`, {
          method: "POST",
          headers: { Authorization: "browser-key" },
          body: "{}",
        });

        expect(response.status).toBe(404);
        expect(response.headers.get("content-type")).toContain("text/plain");
        expect(await response.text()).toBe("Set VERIFY_API_URL to forward /api/v3/verify.");
        expect(dispatched).toBe(false);
      },
    );
  });

  it("ignores paths other than /api/v3/verify", async () => {
    let dispatched = false;

    await withProxy(
      { VERIFY_API_URL: "https://verify.example.com", VERIFY_API_KEY: "default-key" },
      (_target, _req, res) => {
        dispatched = true;
        res.statusCode = 200;
        res.end();
      },
      async (baseUrl) => {
        const prefixed = await fetch(`${baseUrl}/__verify-proxy/verify.example.com/api/v3/verify`, {
          method: "POST",
          body: "{}",
        });
        expect(await prefixed.text()).toBe("next");

        const ignored = await fetch(`${baseUrl}/index.html`);
        expect(await ignored.text()).toBe("next");
        expect(dispatched).toBe(false);
      },
    );
  });
});

type Forwarded = {
  hostname: string;
  path: string;
  method: string;
  authorization?: string;
};

function recordingDispatch(forwarded: Forwarded[]): VerifyApiProxyDispatch {
  return (target, req, res) => {
    forwarded.push(recordForward(target));
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end('{"ok":true}');
    req.resume();
  };
}

function recordForward(target: VerifyApiProxyTarget): Forwarded {
  return {
    hostname: target.hostname,
    path: target.path,
    method: target.method,
    authorization: typeof target.headers.authorization === "string" ? target.headers.authorization : undefined,
  };
}

async function withProxy(
  env: VerifyApiProxyEnv,
  dispatch: VerifyApiProxyDispatch,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const middleware = createVerifyApiProxyMiddleware(env, dispatch);
  const server = http.createServer((req, res) => {
    middleware(req, res, () => {
      res.statusCode = 200;
      res.end("next");
    });
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
  }
}
