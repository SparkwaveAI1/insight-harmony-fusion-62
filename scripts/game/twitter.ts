import { GameAgent, GameWorker, GameFunction } from "@virtuals-protocol/game";
import { ensureGameResponse } from "../../src/lib/game/response"; // <-- correct path

async function main() {
  const apiKey = process.env.GAME_API_KEY;
  if (!apiKey) throw new Error("Missing GAME_API_KEY");

  const twitterWorker = new GameWorker({
    id: "twitter",
    name: "Twitter Worker",
    description: "Posts tweets (stubbed for now)",
    functions: [
      new GameFunction({
        name: "postTweet",
        description: "Post a tweet (<=280 chars)",
        args: [{ name: "text", type: "string", description: "Tweet text" }] as const,
        executable: async ({ text }: { text: string }) => {
          if (typeof text !== "string" || text.length === 0) throw new Error("text is required");
          if (text.length > 280) throw new Error("text exceeds 280 characters");

          // Return a safe stubbed response
          return ensureGameResponse({
            ok: true as const,
            result: { accepted: true, preview: text },
          });
        },
      }),
    ],
    getEnvironment: async () => ({ env: "local-twitter-smoke" }),
  });

  const agent = new GameAgent(apiKey, {
    name: "PersonaAI Twitter Agent",
    goal: "Post tweets",
    description: "Verifies GAME Twitter worker wiring",
    getAgentState: async () => ({ mode: "twitter-smoke" }),
    workers: [twitterWorker],
  });

  await agent.init();
  const res = await agent.step({
    workerId: "twitter",
    fn: "postTweet",
    args: { text: "hello from Twitter smoke test" },
  });

  console.log("TWITTER RESULT:", JSON.stringify(res));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});