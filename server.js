const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

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
    const { message, subscriber_id, intent } = req.body;

    let responseText = "";

    // --- Detect trivia request ---
    if (message && message.toLowerCase().includes("trivia")) {
      const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
      const question = triviaQuestions[randomIndex];
      responseText = `Trivia: ${question.question}\nOptions: ${question.options.join(", ")}`;
    }
    // --- Detect video request ---
    else if (message && (message.toLowerCase().includes("video") || message.toLowerCase().includes("highlight"))) {
      responseText = `🎬 Highlights (up to 3):\n1. https://youtu.be/video1\n2. https://youtu.be/video2\n3. https://youtu.be/video3`;
    }
    // --- Forward everything else to orchestrator MCP ---
    else {
      const HUB_MCP_URL = "https://your-orchestrator.com/mcp"; // replace with your hub MCP
      const HUB_MCP_TOKEN = "YOUR_HUB_TOKEN_HERE";             // replace with your token

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

    res.json({ reply: responseText });
  } catch (error) {
    console.error("Error in /mcp/chat:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Test MCP server running at http://localhost:${PORT}`);
});
