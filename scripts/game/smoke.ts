import { GameAgent, GameWorker, GameFunction } from "@virtuals-protocol/game";
import { ensureGameResponse } from "../../src/lib/game/response";

async function main() {
  const apiKey = process.env.GAME_API_KEY;
  if (!apiKey) throw new Error("Missing GAME_API_KEY");

  const smokeWorker = new GameWorker({
    id: "smoke",
    name: "Smoke Test Worker",
    description: "Basic echo test for GAME SDK",
    functions: [
      new GameFunction({
        name: "echo",
        description: "Echo back the input text",
        args: [{ name: "message", type: "string", description: "Message to echo" }] as const,
        executable: async ({ message }: { message: string }) => {
          if (typeof message !== "string") throw new Error("message must be a string");

          // Return a safe stubbed response
          return ensureGameResponse({
            ok: true as const,
            result: { echoed: message, timestamp: new Date().toISOString() },
          });
        },
      }),
    ],
    getEnvironment: async () => ({ env: "local-smoke-test" }),
  });

  const agent = new GameAgent(apiKey, {
    name: "PersonaAI Smoke Test Agent",
    goal: "Test GAME SDK integration",
    description: "Verifies basic GAME Worker functionality",
    getAgentState: async () => ({ mode: "smoke-test" }),
    workers: [smokeWorker],
  });

  await agent.init();
  const res = await agent.step({
    workerId: "smoke",
    fn: "echo",
    args: { message: "hello-game" },
  });

  console.log("SMOKE RESULT:", JSON.stringify(res));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});