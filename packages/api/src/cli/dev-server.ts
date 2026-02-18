import { createApiServer } from "../server.js";
import { isExecutedDirectly, loadEnvFromDisk, logStep } from "./utils.js";

export async function runDevServer(port = 3001): Promise<void> {
  const envPath = loadEnvFromDisk();
  logStep(`Loaded environment from ${envPath}`);

  const server = createApiServer({
    seedAgents: true,
    autonomy: {
      enabled: false
    },
    clawdbots: {
      enabled: false
    },
    agentPlatform: {
      enabled: true,
      agentOnlyMode: false,
      legacyRoutesEnabled: true,
      selfRegistrationEnabled: true
    },
    cors: {
      allowedOrigins: "*"
    }
  });

  const boundPort = await server.start(port);

  logStep("Simulacrum dev server running");
  logStep(`  http://127.0.0.1:${boundPort}`);
  logStep(`  WebSocket: ws://127.0.0.1:${boundPort}/ws`);
  logStep("");
  logStep("Legacy routes (no auth required):");
  logStep("  GET    /health");
  logStep("  GET    /markets");
  logStep("  POST   /markets");
  logStep("  GET    /markets/:id");
  logStep("  POST   /markets/:id/bets");
  logStep("  POST   /markets/:id/resolve");
  logStep("  POST   /markets/:id/self-attest");
  logStep("  POST   /markets/:id/challenge");
  logStep("  POST   /markets/:id/oracle-vote");
  logStep("  POST   /markets/:id/claims");
  logStep("  POST   /markets/:id/orders");
  logStep("  GET    /markets/:id/orderbook");
  logStep("  GET    /agents");
  logStep("  GET    /reputation/:accountId");
  logStep("");
  logStep("Agent platform routes (JWT auth):");
  logStep("  POST   /agent/v1/auth/register");
  logStep("  POST   /agent/v1/auth/challenge");
  logStep("  POST   /agent/v1/auth/verify");
  logStep("  GET    /agent/v1/wallet/balance");
  logStep("  POST   /agent/v1/wallet/faucet/request");
  logStep("  ...    /agent/v1/markets/*");

  await new Promise<void>((resolve, reject) => {
    const shutdown = async () => {
      logStep("Shutting down...");
      try {
        await server.stop();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    process.once("SIGINT", () => {
      void shutdown();
    });
    process.once("SIGTERM", () => {
      void shutdown();
    });
  });
}

if (isExecutedDirectly(import.meta.url)) {
  const portArg = process.argv.find((arg) => arg.startsWith("--port="));
  const port = portArg ? Number(portArg.split("=")[1]) : 3001;

  runDevServer(port).catch((error) => {
    console.error("[dev] Server failed:", error);
    process.exitCode = 1;
  });
}
