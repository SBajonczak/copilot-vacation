// Import required packages
import * as restify from "restify";

// This bot's adapter
import adapter from "./adapter";

// This bot's main dialog.
import { PromptApp } from "./app/PromptApp";
import { HandleActionResponse } from "botbuilder";
import AdaptiveCardHandler from "./app/AdaptiveCardHandler";

const promtApp = new PromptApp();
const handler:AdaptiveCardHandler = new AdaptiveCardHandler(); 
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
    // Check for incoming message activity
    if (handler.isAction(context)) {
      // Check if the action is from our button
      handler.Handle(context);
    } else {
      await promtApp.run(context);
    }
  });
});
