import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import https from "node:https";

import { loadEnv, type Connect, type Plugin } from "vite";

const DIRECT_VERIFY_API_PATH = "/api/v3/verify";

export type VerifyApiProxyEnv = Readonly<Record<string, string>>;

export type VerifyApiProxyTarget = {
  hostname: string;
  port?: number;
  path: string;
  method: string;
  headers: http.OutgoingHttpHeaders;
};

export type VerifyApiProxyDispatch = (target: VerifyApiProxyTarget, req: IncomingMessage, res: ServerResponse) => void;

type ConfiguredVerifyApiTarget =
  | { kind: "unset" }
  | { kind: "invalid" }
  | { kind: "forward"; hostname: string; port?: number; path: string };

/**
 * Dev-server middleware for `POST /api/v3/verify`.
 *
 * `env` is supplied by the caller so tests do not read `process.env`. The browser `Authorization` header is ignored.
 * Answers `OPTIONS` itself so tests can mount the middleware without Vite's CORS middleware. Other paths are ignored.
 */
export function createVerifyApiProxyMiddleware(
  env: VerifyApiProxyEnv,
  dispatch: VerifyApiProxyDispatch = dispatchVerifyApiProxy,
): Connect.NextHandleFunction {
  return (req, res, next) => {
    const requestUrl = req.url ?? "";
    if (!isDirectVerifyApiRoute(requestUrl)) {
      next();
      return;
    }

    handleDirectVerifyRoute(req, res, next, env, dispatch, requestUrl);
  };
}

/**
 * Proxies BlinkID Verify while `vite` is serving.
 *
 * `POST /api/v3/verify` forwards to the host in `VERIFY_API_URL` and attaches `VERIFY_API_KEY` when it is non-empty.
 * The upstream path is always `/api/v3/verify`. Names are loaded without the `VITE_` prefix so they are not inlined
 * into the client bundle.
 */
export function verifyApiDevProxy(): Plugin {
  return {
    name: "verify-api-dev-proxy",
    configureServer(server) {
      // An empty prefix keeps `VERIFY_API_*` off the client. `VITE_` names would be inlined into the bundle.
      const env = loadEnv(server.config.mode, server.config.envDir, "");
      server.middlewares.use(createVerifyApiProxyMiddleware(env));
    },
  };
}

export function applyCorsHeaders(req: IncomingMessage, res: ServerResponse): void {
  const origin = req.headers.origin;
  if (typeof origin === "string" && origin.length > 0) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Access-Control-Max-Age", "600");
}

export function endPreflight(res: ServerResponse): void {
  res.statusCode = 204;
  res.end();
}

export function readEnv(env: VerifyApiProxyEnv, name: string): string | undefined {
  const value = env[name];
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Forwards one Verify request. `authorization` comes from env, never from the browser. */
export function forwardVerifyApiProxy(
  req: IncomingMessage,
  res: ServerResponse,
  dispatch: VerifyApiProxyDispatch,
  target: { hostname: string; port?: number; path: string },
  authorization: string | undefined,
): void {
  const headers = forwardedHeaders(req);
  if (authorization) {
    headers.authorization = authorization;
  }

  dispatch(
    {
      hostname: target.hostname,
      port: target.port,
      path: target.path,
      method: req.method ?? "POST",
      headers,
    },
    req,
    res,
  );
}

export function dispatchVerifyApiProxy(target: VerifyApiProxyTarget, req: IncomingMessage, res: ServerResponse): void {
  const upstream = https.request(
    {
      protocol: "https:",
      hostname: target.hostname,
      port: target.port,
      path: target.path,
      method: target.method,
      headers: target.headers,
    },
    (upstreamResponse) => {
      res.statusCode = upstreamResponse.statusCode ?? 502;
      const contentType = upstreamResponse.headers["content-type"];
      if (contentType) {
        res.setHeader("content-type", contentType);
      }
      upstreamResponse.pipe(res);
    },
  );

  upstream.on("error", () => {
    if (res.headersSent || res.writableEnded) {
      res.destroy();
      return;
    }
    res.statusCode = 502;
    res.end();
  });

  req.on("aborted", () => {
    upstream.destroy();
  });

  req.pipe(upstream);
}

function handleDirectVerifyRoute(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
  env: VerifyApiProxyEnv,
  dispatch: VerifyApiProxyDispatch,
  requestUrl: string,
): void {
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    next();
    return;
  }

  applyCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    endPreflight(res);
    return;
  }

  const target = resolveConfiguredVerifyApiTarget(readEnv(env, "VERIFY_API_URL"), requestUrl);
  if (target.kind === "unset") {
    endText(res, 404, "Set VERIFY_API_URL to forward /api/v3/verify.");
    return;
  }
  if (target.kind === "invalid") {
    endText(res, 404, "VERIFY_API_URL must be an https URL.");
    return;
  }

  forwardVerifyApiProxy(req, res, dispatch, target, readEnv(env, "VERIFY_API_KEY"));
}

function isDirectVerifyApiRoute(requestUrl: string): boolean {
  const pathOnly = requestUrl.split("?")[0] ?? "";
  return pathOnly === DIRECT_VERIFY_API_PATH || pathOnly === `${DIRECT_VERIFY_API_PATH}/`;
}

/** Upstream for `/api/v3/verify`. The path is always that route on the configured host. */
function resolveConfiguredVerifyApiTarget(
  verifyApiUrl: string | undefined,
  requestUrl: string,
): ConfiguredVerifyApiTarget {
  if (!verifyApiUrl) {
    return { kind: "unset" };
  }

  let url: URL;
  try {
    url = new URL(verifyApiUrl);
  } catch {
    return { kind: "invalid" };
  }

  if (url.protocol !== "https:" || !url.hostname) {
    return { kind: "invalid" };
  }

  const port = url.port === "" ? undefined : Number(url.port);
  if (port !== undefined && !Number.isInteger(port)) {
    return { kind: "invalid" };
  }

  return {
    kind: "forward",
    hostname: url.hostname,
    port,
    path: `${DIRECT_VERIFY_API_PATH}${requestQuery(requestUrl)}`,
  };
}

function requestQuery(requestUrl: string): string {
  const queryIndex = requestUrl.indexOf("?");
  return queryIndex === -1 ? "" : requestUrl.slice(queryIndex);
}

/** Copies request headers the upstream needs. `authorization` is injected from env, never from the browser. */
function forwardedHeaders(req: IncomingMessage): http.OutgoingHttpHeaders {
  const headers: http.OutgoingHttpHeaders = {};
  copyRequestHeader(req, headers, "content-type");
  copyRequestHeader(req, headers, "accept");
  copyRequestHeader(req, headers, "content-length");
  return headers;
}

function copyRequestHeader(req: IncomingMessage, headers: http.OutgoingHttpHeaders, name: string): void {
  const value = req.headers[name];
  if (typeof value === "string") {
    headers[name] = value;
  }
}

function endText(res: ServerResponse, status: number, body: string): void {
  res.statusCode = status;
  res.setHeader("content-type", "text/plain; charset=utf-8");
  res.end(body);
}
