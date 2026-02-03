const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------
// Load trivia JSON
// ---------------------
const triviaPath = path.join(__dirname, "trivia.json");
let triviaQuestions = [];
try {
  triviaQuestions = JSON.parse(fs.readFileSync(triviaPath, "utf-8"));
} catch (err) {
  console.warn(
    "Trivia file not found or invalid, using fallback question.",
    err.message
  );
  triviaQuestions = [
    {
      question: "Test question: Who won the Heisman in 2017?",
      options: ["Baker Mayfield", "Kyler Murray", "Sam Bradford", "Jason White"],
      answer: "Baker Mayfield"
    }
  ];
}

// ---------------------
// Optional orchestrator MCP
// ---------------------
const HUB_MCP_URL = "https://pmg-test-production.up.railway.app"; // e.g., "https://your-orchestrator.com/mcp"
const HUB_MCP_TOKEN = ""; // leave empty if no token

// ---------------------
// Express setup
// ---------------------
app.use(bodyParser.json());

// ---------------------
// MCP endpoint for PMG
// ---------------------
app.post("/mcp", async (req, res) => {
  try {
    const { message, subscriber_id } = req.body;

    let responseText = "";

    // --- Detect trivia request ---
    if (message && message.toLowerCase().includes("trivia")) {
      const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
      const question = triviaQuestions[randomIndex];
      responseText = `Trivia: ${question.question}\nOptions: ${question.options.join(", ")}`;
    }
    // --- Detect video/highlight request ---
    else if (
      message &&
      (message.toLowerCase().includes("video") ||
        message.toLowerCase().includes("highlight"))
    ) {
      responseText =
        "🎬 Highlights (up to 3):\n1. https://youtu.be/video1\n2. https://youtu.be/video2\n3. https://youtu.be/video3";
    }
    // --- Forward to orchestrator MCP (optional) ---
    else if (HUB_MCP_URL) {
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream"
      };
      if (HUB_MCP_TOKEN) {
        headers["Authorization"] = `Bearer ${HUB_MCP_TOKEN}`;
      }

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
        { headers }
      );

      responseText =
        hubResponse.data?.result || "Orchestrator did not return a response.";
    }
    // --- Default fallback ---
    else {
      responseText =
        "Sorry, I can only handle trivia or video requests for now.";
    }

    res.json({ reply: responseText });
  } catch (error) {
    console.error("Error in /mcp:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------
// Start server
// ---------------------
app.listen(PORT, () => {
  console.log(`Test MCP server running at http://localhost:${PORT}`);
});
