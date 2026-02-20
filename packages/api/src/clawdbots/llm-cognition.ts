import { randomUUID } from "node:crypto";

import type { BaseAgent, MarketSnapshot } from "@simulacrum/agents";

export type LlmProvider = "openai";

export interface LlmProviderConfig {
  provider?: LlmProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export type ClawdbotGoalStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export interface ClawdbotGoal {
  id: string;
  botId: string;
  title: string;
  detail: string;
  status: ClawdbotGoalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
}

export type ClawdbotPlannedActionType =
  | "CREATE_MARKET"
  | "PUBLISH_ORDER"
  | "PLACE_BET"
  | "RESOLVE_MARKET"
  | "WAIT";

export interface ClawdbotPlannedAction {
  type: ClawdbotPlannedActionType;
  marketId?: string;
  outcome?: string;
  side?: "BID" | "ASK";
  initialOddsByOutcome?: Record<string, number>;
  quantity?: number;
  price?: number;
  amountHbar?: number;
  prompt?: string;
  resolvedOutcome?: string;
  reason?: string;
  confidence: number;
  rationale: string;
}

export interface MarketSentimentMap {
  [marketId: string]: { [outcome: string]: number };
}

interface GoalContext {
  bot: BaseAgent;
  markets: MarketSnapshot[];
  reputationByAccount?: Record<string, number>;
  marketSentiment?: MarketSentimentMap;
  lastFailedGoal?: ClawdbotGoal;
}

interface ActionContext {
  goal: ClawdbotGoal;
  bot: BaseAgent;
  markets: MarketSnapshot[];
  reputationByAccount?: Record<string, number>;
  marketSentiment?: MarketSentimentMap;
  lastFailedGoal?: ClawdbotGoal;
}

// Free OpenRouter models to rotate through when rate-limited
const FALLBACK_MODELS = [
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "google/gemma-3-4b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "qwen/qwen3-4b:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "stepfun/step-3.5-flash:free",
];

function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return fenceMatch ? fenceMatch[1]!.trim() : trimmed;
}

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(stripMarkdownFences(raw)) as T;
  } catch {
    return null;
  }
}

function waitAction(reason: string): ClawdbotPlannedAction {
  return {
    type: "WAIT",
    confidence: 0,
    rationale: reason
  };
}

export class LlmCognitionEngine {
  readonly #config: LlmProviderConfig;

  constructor(config: LlmProviderConfig) {
    this.#config = config;
  }

  async generateGoal(context: GoalContext): Promise<ClawdbotGoal> {
    const now = new Date().toISOString();
    const result = await this.#askGoalModel(context);

    if (!result) {
      return {
        id: randomUUID(),
        botId: context.bot.id,
        title: "Waiting for LLM",
        detail: "LLM provider unavailable — skipping this tick.",
        status: "PENDING",
        createdAt: now,
        updatedAt: now
      };
    }

    return {
      id: randomUUID(),
      botId: context.bot.id,
      title: result.title,
      detail: result.detail,
      status: "PENDING",
      createdAt: now,
      updatedAt: now
    };
  }

  async decideAction(context: ActionContext): Promise<ClawdbotPlannedAction> {
    const result = await this.#askActionModel(context);

    if (result) {
      return result;
    }

    return waitAction("LLM provider unavailable — no scripted fallback, waiting for next tick.");
  }

  /**
   * Send a chat completion request, rotating through fallback models on 429.
   */
  async #chatCompletion(
    label: string,
    messages: Array<{ role: string; content: string }>,
    temperature = 0.7
  ): Promise<string | null> {
    const apiKey = this.#config.apiKey;

    if (!apiKey) {
      console.warn(`[llm-cognition] No API key configured — skipping ${label}.`);
      return null;
    }

    const baseUrl = this.#config.baseUrl ?? "https://api.openai.com/v1";
    const primaryModel = this.#config.model ?? "gpt-4o-mini";
    const models = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];

    for (const model of models) {
      const url = `${baseUrl}/chat/completions`;
      console.log(`[llm-cognition] ${label} → model=${model}`);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ model, temperature, messages })
        });

        if (response.status === 429) {
          console.warn(`[llm-cognition] ${label} rate-limited on ${model}, trying next model...`);
          continue;
        }

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          console.error(`[llm-cognition] ${label} failed: HTTP ${response.status} — ${body}`);
          return null;
        }

        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = payload.choices?.[0]?.message?.content;

        if (!content) {
          console.warn(`[llm-cognition] ${label} returned empty content from ${model}, trying next model...`);
          continue;
        }

        console.log(`[llm-cognition] ${label} succeeded with ${model}`);
        return content;
      } catch (error) {
        console.error(`[llm-cognition] ${label} fetch error on ${model}: ${error instanceof Error ? error.message : error}`);
        continue;
      }
    }

    console.error(`[llm-cognition] ${label} failed: all models exhausted.`);
    return null;
  }

  async #askGoalModel(context: GoalContext): Promise<{ title: string; detail: string } | null> {
    const openMarkets = context.markets.filter((m) => m.status === "OPEN");
    const bettableCount = openMarkets.filter((m) => m.creatorAccountId !== context.bot.accountId).length;
    const ownCount = openMarkets.length - bettableCount;
    const sentimentLines = this.#formatSentimentForPrompt(openMarkets, context.marketSentiment);

    const prompt = [
      `You are "${context.bot.name}", an autonomous prediction-market agent on the Simulacrum platform (Hedera testnet).`,
      "You have your own wallet and bankroll. You independently create markets, place bets, and provide liquidity to maximize your returns.",
      "",
      "RULE: You CANNOT bet on or place orders on markets you created. Only on markets created by OTHER agents.",
      "",
      "AVAILABLE ACTIONS:",
      "- CREATE_MARKET: Invent a new prediction market on ANY topic — politics, tech, sports, science, crypto, culture, world events, weather, anything. Be creative and varied. NEVER repeat a topic that already has an open market.",
      "- PLACE_BET: Bet on another agent's market if you have a view.",
      "- PUBLISH_ORDER: Post BID/ASK orders to provide liquidity or trade positions.",
      "- WAIT: Skip this turn (only if nothing looks interesting).",
      "",
      "STRATEGY TIPS:",
      "- Create markets on diverse, timely topics that will attract bets from other agents.",
      "- If sentiment is lopsided (>65% on one side), the other side may be underpriced.",
      "- Balance creating new markets with betting on existing ones. Both are valuable.",
      "- NEVER resolve markets — the oracle handles that.",
      "",
      "Produce a single goal with a title and detail describing what you want to do this turn.",
      "Return JSON only, no markdown fences: {\"title\": string, \"detail\": string}.",
      "",
      `Your bankroll: ${context.bot.bankrollHbar} HBAR`,
      `Open markets by others (you CAN bet on): ${bettableCount}`,
      `Your own open markets (you CANNOT bet on): ${ownCount}`,
      sentimentLines ? `\nMARKET SENTIMENT:\n${sentimentLines}` : "",
      context.lastFailedGoal
        ? `\nLAST GOAL FAILED: "${context.lastFailedGoal.title}" — Error: ${context.lastFailedGoal.error ?? "unknown"}. Try a different approach.`
        : ""
    ].filter(Boolean).join("\n");

    const raw = await this.#chatCompletion("Goal", [{ role: "user", content: prompt }], 0.85);

    if (!raw) {
      return null;
    }

    const parsed = parseJson<{ title?: string; detail?: string }>(raw);
    const title = parsed?.title?.trim();
    const detail = parsed?.detail?.trim();

    if (!title || !detail) {
      return null;
    }

    return { title, detail };
  }

  async #askActionModel(context: ActionContext): Promise<ClawdbotPlannedAction | null> {
    const openMarkets = context.markets.filter((m) => m.status === "OPEN");
    const bettableMarkets = openMarkets.filter((m) => m.creatorAccountId !== context.bot.accountId);
    const ownMarkets = openMarkets.filter((m) => m.creatorAccountId === context.bot.accountId);
    const marketLines = bettableMarkets.map((m) => {
      const sentimentData = context.marketSentiment?.[m.id];
      const sentimentStr = sentimentData
        ? ` | sentiment: ${Object.entries(sentimentData).map(([o, v]) => `${o}=${(v * 100).toFixed(0)}%`).join(", ")}`
        : "";
      return `  ${m.id}: "${m.question}" [${m.outcomes.join("/")}]${sentimentStr}`;
    }).join("\n");
    const bettableInfo = bettableMarkets.length > 0 ? `\n${marketLines}` : "none";
    const ownMarketInfo = ownMarkets.length > 0
      ? ownMarkets.map((m) => `  ${m.id}: "${m.question}"`).join("\n")
      : "none";

    const prompt = [
      `You are "${context.bot.name}", an autonomous prediction-market agent on the Simulacrum platform (Hedera testnet).`,
      "",
      "RULE: You CANNOT bet on or place orders on your own markets. Only on markets created by OTHER agents.",
      "",
      "Pick ONE action to execute your goal.",
      "Action types: CREATE_MARKET, PUBLISH_ORDER, PLACE_BET, WAIT.",
      "",
      "CREATE_MARKET: Provide a \"prompt\" (a clear, verifiable prediction question on ANY topic — politics, tech, sports, science, crypto, AI, culture, weather, economics, entertainment, etc.) and \"initialOddsByOutcome\". Be creative and pick a DIFFERENT topic from existing markets.",
      "PLACE_BET: Provide marketId, outcome, amountHbar (1-5 HBAR). Must use a marketId from the bettable list below.",
      "PUBLISH_ORDER: Provide marketId, outcome, side (BID/ASK), quantity (1-50), price (0.01-0.99). Must use a marketId from the bettable list below.",
      "WAIT: Only if there are truly no opportunities.",
      "",
      "Return JSON only, no markdown fences:",
      "{\"type\": string, \"marketId\"?: string, \"outcome\"?: string, \"side\"?: \"BID\"|\"ASK\", \"quantity\"?: number, \"price\"?: number, \"amountHbar\"?: number, \"prompt\"?: string, \"initialOddsByOutcome\"?: {\"OUTCOME\": number}, \"confidence\": number, \"rationale\": string}",
      "",
      `Bankroll: ${context.bot.bankrollHbar} HBAR`,
      `Goal: ${context.goal.title} — ${context.goal.detail}`,
      `Bettable markets (created by others): ${bettableInfo}`,
      `Your own markets (cannot bet on): ${ownMarketInfo}`,
      context.lastFailedGoal
        ? `\nLAST GOAL FAILED: "${context.lastFailedGoal.title}" — "${context.lastFailedGoal.error ?? "unknown"}". Choose a different action or market.`
        : ""
    ].join("\n");

    const raw = await this.#chatCompletion("Action", [{ role: "user", content: prompt }], 0.85);

    if (!raw) {
      return null;
    }

    const parsed = parseJson<Partial<ClawdbotPlannedAction>>(raw);

    if (!parsed?.type || typeof parsed.rationale !== "string") {
      return null;
    }

    const allowed = new Set<ClawdbotPlannedActionType>([
      "CREATE_MARKET",
      "PUBLISH_ORDER",
      "PLACE_BET",
      "WAIT"
    ]);

    if (!allowed.has(parsed.type as ClawdbotPlannedActionType)) {
      return null;
    }

    const initialOddsByOutcome =
      parsed.initialOddsByOutcome && typeof parsed.initialOddsByOutcome === "object"
        ? Object.entries(parsed.initialOddsByOutcome).reduce<Record<string, number>>((acc, [key, value]) => {
            const numericValue = Number(value);

            if (Number.isFinite(numericValue) && numericValue > 0) {
              acc[key.trim().toUpperCase()] = numericValue;
            }

            return acc;
          }, {})
        : undefined;

    return {
      type: parsed.type as ClawdbotPlannedActionType,
      marketId: parsed.marketId,
      outcome: parsed.outcome,
      side: parsed.side === "ASK" ? "ASK" : parsed.side === "BID" ? "BID" : undefined,
      initialOddsByOutcome:
        initialOddsByOutcome && Object.keys(initialOddsByOutcome).length > 0
          ? initialOddsByOutcome
          : undefined,
      quantity: typeof parsed.quantity === "number" ? parsed.quantity : undefined,
      price: typeof parsed.price === "number" ? parsed.price : undefined,
      amountHbar: typeof parsed.amountHbar === "number" ? parsed.amountHbar : undefined,
      prompt: parsed.prompt,
      resolvedOutcome: parsed.resolvedOutcome,
      reason: parsed.reason,
      confidence:
        typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0.5,
      rationale: parsed.rationale
    };
  }

  #formatSentimentForPrompt(
    openMarkets: MarketSnapshot[],
    sentiment?: MarketSentimentMap
  ): string {
    if (!sentiment || openMarkets.length === 0) {
      return "";
    }

    const lines: string[] = [];

    for (const m of openMarkets) {
      const s = sentiment[m.id];

      if (!s) {
        continue;
      }

      const parts = Object.entries(s)
        .map(([outcome, frac]) => `${outcome}=${(frac * 100).toFixed(0)}%`)
        .join(", ");
      lines.push(`  "${m.question}" (${m.id}): ${parts}`);
    }

    return lines.join("\n");
  }
}
