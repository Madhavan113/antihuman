/**
 * Lightweight MoltbookClient matching the @moltbook/sdk API surface.
 *
 * The official npm package (`@moltbook/sdk`) is documented in the
 * agent-development-kit repo but not yet published. This module
 * implements the subset we need (posts.create) against the documented
 * REST API so the integration works today and can be swapped for the
 * real SDK later with zero call-site changes.
 */

export interface MoltbookClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface CreatePostInput {
  submolt: string;
  title: string;
  content: string;
}

export interface MoltbookPost {
  id: string;
  submolt: string;
  title: string;
  content: string;
  createdAt: string;
  [key: string]: unknown;
}

export class MoltbookError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "MoltbookError";
  }
}

export class MoltbookClient {
  readonly #apiKey: string;
  readonly #baseUrl: string;
  readonly #timeout: number;
  readonly #retries: number;
  readonly #retryDelay: number;

  constructor(options: MoltbookClientOptions) {
    if (!options.apiKey) throw new MoltbookError("apiKey is required");
    this.#apiKey = options.apiKey;
    this.#baseUrl = (options.baseUrl ?? "https://www.moltbook.com/api/v1").replace(/\/+$/, "");
    this.#timeout = options.timeout ?? 15_000;
    this.#retries = options.retries ?? 2;
    this.#retryDelay = options.retryDelay ?? 1_000;
  }

  readonly posts = {
    create: async (input: CreatePostInput): Promise<MoltbookPost> => {
      return this.#request<MoltbookPost>("POST", "/posts", input);
    },
  };

  readonly agents = {
    me: async (): Promise<Record<string, unknown>> => {
      return this.#request<Record<string, unknown>>("GET", "/agents/me");
    },
  };

  async #request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.#retries; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, this.#retryDelay * attempt));
      }

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.#timeout);

        const response = await fetch(`${this.#baseUrl}${path}`, {
          method,
          headers: {
            "Authorization": `Bearer ${this.#apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "simulacrum/0.1.0",
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          if (response.status === 429 && attempt < this.#retries) {
            lastError = new MoltbookError(`Rate limited (${response.status})`, response.status, text);
            continue;
          }
          throw new MoltbookError(
            `Moltbook API ${method} ${path} failed: ${response.status}`,
            response.status,
            text,
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error;
        if (error instanceof MoltbookError) throw error;
        if (attempt === this.#retries) break;
      }
    }

    throw lastError instanceof MoltbookError
      ? lastError
      : new MoltbookError(`Moltbook API request failed after ${this.#retries + 1} attempts`, undefined, lastError);
  }
}
