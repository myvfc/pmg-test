import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();

// Use environment port or fallback to 3000
const PORT = process.env.PORT || 3000;

// Enable JSON parsing
app.use(express.json());
app.use(cors());

// Safe path for trivia file
const triviaPath = path.resolve("trivia.json");
let trivia = [];

try {
  const data = fs.readFileSync(triviaPath, "utf-8");
  trivia = JSON.parse(data);
  console.log(`Loaded ${trivia.length} trivia questions`);
} catch (err) {
  console.warn(`Could not load trivia.json: ${err.message}`);
  trivia = [];
}

// Browser-friendly route for sanity check
app.get("/", (req, res) => {
  res.send("MCP server is running. POST to /mcp with JSON to interact.");
});

// MCP endpoint for PMG bot
app.post("/mcp", (req, res) => {
  const userMessage = req.body?.message || "";
  console.log("Incoming message:", userMessage);

  if (!userMessage) {
    return res.json({ reply: "No message received." });
  }

  // Simple trivia response
  let reply;
  if (/trivia/i.test(userMessage) && trivia.length > 0) {
    const question = trivia[Math.floor(Math.random() * trivia.length)];
    reply = `Trivia: ${question.question} Options: ${question.options.join(", ")}`;
  } else {
    reply = `You said: "${userMessage}"`;
  }

  res.json({ reply });
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
app.get("/", (req, res) => {
  res.send("MCP server is running. POST to /mcp with JSON to interact.");
});

