import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Load trivia JSON
const triviaPath = path.join(__dirname, "ou_sooner_trivia_500.json");
const triviaQuestions = JSON.parse(fs.readFileSync(triviaPath, "utf-8"));

app.use(bodyParser.json());

// ---------------------
// Test MCP endpoint
// ---------------------
app.post("/mcp/chat", async (req, res) => {
  try {
    const { message, subscriber_id, intent } = req.body; // message from chatbot front-end

    // --- Detect trivia request ---
    let responseText = "";
    if (message.toLowerCase().includes("trivia")) {
      // pick a random question
      const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
      const question = triviaQuestions[randomIndex];
      responseText = `Trivia: ${question.question}\nOptions: ${question.options.join(", ")}`;
    }
    // --- Detect video request ---
    else if (message.toLowerCase().includes("video") || message.toLowerCase().includes("highlight")) {
      // Return up to 3 mock video links
      responseText = `🎬 Highlights:\n1. https://youtu.be/video1\n2. https://youtu.be/video2\n3. https://youtu.be/video3`;
    }
    // --- Otherwise, call hub/orchestrator MCP ---
    else {
      // Replace with your actual orchestrator MCP URL and token
      const HUB_MCP_URL = "https://your-orchestrator.com/mcp";
      const HUB_MCP_TOKEN = "YOUR_HUB_TOKEN_HERE";

      // Call orchestrator MCP
      const hubResponse = await axios.post(
        HUB_MCP_URL,
        {
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "chat",
            arguments: { message, subscriber_id }
          }
        },
        {
          headers: {
            "Authorization": `Bearer ${HUB_MCP_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
          }
        }
      );

      responseText = hubResponse.data?.result || "Orchestrator did not return a response.";
    }

    res.json({
      reply: responseText
    });
  } catch (error) {
    console.error("Error in /mcp/chat:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Test MCP server running at http://localhost:${PORT}`);
});
