/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

const pingEndpoints = {
  DEV: "https://ping.dev.microblink.com/api/v3/ping",
  PROD: "https://ping.microblink.com/api/v3/ping",
} as const;

const requestTimeoutMs = 5_000;
const retryDelayMs = 3_000;
const maxRetries = 3;

declare const __PING_ANALYTICS_ENV__: keyof typeof pingEndpoints;

function delay(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function resolvePingEndpoint(baseUrl: string): string {
  const url = new URL(baseUrl);
  const path = url.pathname.replace(/\/+$/, "");

  url.pathname = path.endsWith("/api/v3/ping") ? path : `${path}/api/v3/ping`;

  return url.toString();
}

export class PingTransport {
  #endpoint: string = pingEndpoints[__PING_ANALYTICS_ENV__];
  readonly #inFlight = new Set<Promise<void>>();

  setEndpoint(endpoint: string): void {
    this.#endpoint = endpoint;
  }

  send(payload: string): void {
    const request = this.#send(payload).finally(() => this.#inFlight.delete(request));
    this.#inFlight.add(request);
  }

  async waitForIdle(deadline: number): Promise<void> {
    while (this.#inFlight.size > 0 && Date.now() < deadline) {
      await delay(Math.min(50, deadline - Date.now()));
    }
  }

  async #send(payload: string): Promise<void> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

        try {
          const response = await fetch(this.#endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: payload,
            signal: controller.signal,
          });

          if (response.ok) {
            return;
          }

          lastError = new Error(`Ping request failed with status ${response.status}`);
        } finally {
          clearTimeout(timeout);
        }
      } catch (error) {
        lastError = error;
      }

      if (attempt < maxRetries) {
        await delay(retryDelayMs);
      }
    }

    console.warn("Failed to send Biometrics pinglets:", lastError);
  }
}
