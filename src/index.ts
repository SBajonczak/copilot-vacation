// Import required packages
import * as restify from "restify";

// This bot's adapter
import adapter from "./adapter";

// This bot's main dialog.
import { PromptApp } from "./app/PromptApp";

const promtApp  = new PromptApp();
// Create HTTP server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
});

// Listen for incoming server requests.
server.post("/api/messages", async (req, res) => {
  // Route received a request to adapter for processing
  await adapter.process(req, res as any, async (context) => {
    await promtApp.run(context);
  });
});
