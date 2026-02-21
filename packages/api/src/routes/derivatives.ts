import { Router } from "express";
import {
  getDerivativesStore,
  getPosition,
  getPositionsForAccount,
  getOption,
  getAvailableOptions,
  getMarginAccount,
  getFundingHistory,
  getOpenInterest,
  getInsuranceFund,
  getRecentLiquidations
} from "@simulacrum/derivatives";

import type { ApiEventBus } from "../events.js";

export function createDerivativesRouter(_eventBus: ApiEventBus): Router {
  const router = Router();

  router.get("/positions", (_req, res) => {
    const store = getDerivativesStore();
    const positions = Array.from(store.positions.values());
    res.json({ positions });
  });

  router.get("/positions/:id", (req, res) => {
    try {
      const position = getPosition(req.params.id);
      res.json({ position });
    } catch {
      res.status(404).json({ error: `Position ${req.params.id} not found.` });
    }
  });

  router.get("/options", (_req, res) => {
    const store = getDerivativesStore();
    const options = Array.from(store.options.values());
    res.json({ options });
  });

  router.get("/options/:id", (req, res) => {
    try {
      const option = getOption(req.params.id);
      res.json({ option });
    } catch {
      res.status(404).json({ error: `Option ${req.params.id} not found.` });
    }
  });

  router.get("/margin/:accountId", (req, res) => {
    try {
      const account = getMarginAccount(req.params.accountId);
      res.json({ account });
    } catch {
      res.status(404).json({ error: `Margin account for ${req.params.accountId} not found.` });
    }
  });

  router.get("/funding/:marketId", (req, res) => {
    const outcome = typeof req.query.outcome === "string" ? req.query.outcome : "YES";
    const rates = getFundingHistory(req.params.marketId, outcome);
    res.json({ rates });
  });

  router.get("/overview", (_req, res) => {
    const store = getDerivativesStore();
    const positions = Array.from(store.positions.values());
    const options = Array.from(store.options.values());
    const openPositions = positions.filter((p) => p.status === "OPEN");

    const totalOpenInterestHbar = openPositions.reduce((sum, p) => sum + p.sizeHbar, 0);
    const totalMarginLockedHbar = Array.from(store.margins.values())
      .reduce((sum, m) => sum + m.lockedHbar, 0);
    const insuranceFund = getInsuranceFund();
    const recentFundingRates = Array.from(store.fundingRates.values())
      .flat()
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .slice(0, 20);
    const recentLiquidations = getRecentLiquidations(20);

    res.json({
      totalOpenInterestHbar,
      totalPositions: openPositions.length,
      totalOptions: options.filter((o) => o.status === "ACTIVE").length,
      totalMarginLockedHbar,
      insuranceFundHbar: insuranceFund.balanceHbar,
      recentFundingRates,
      recentLiquidations
    });
  });

  return router;
}
