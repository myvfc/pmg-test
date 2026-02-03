import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// Load trivia file safely
// -----------------------------
const triviaPath = "./trivia.json";
let trivia = [];

try {
  const data = fs.readFileSync(triviaPath, "utf-8");
  trivia = JSON.parse(data);
  console.log(`Loaded ${trivia.length} trivia questions`);
} catch (err) {
  console.error("Failed to load trivia.json:", err);
}

// -----------------------------
// MCP POST endpoint
// -----------------------------
app.post("/mcp", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.json({ reply: "No message received." });
  }

  // Trivia request
  if (message.toLowerCase().includes("trivia")) {
    if (!trivia.length) {
      return res.json({ reply: "Trivia file is empty or missing." });
    }

    const q = trivia[Math.floor(Math.random() * trivia.length)];

    // Validate question format
    if (!q || !q.question) {
      return res.json({ reply: "Trivia question format error." });
    }

    const optionsText = Array.isArray(q.options) ? q.options.join(", ") : "No options provided";
    return res.json({ reply: `Trivia: ${q.question} Options: ${optionsText}` });
  }

  // Default reply
  return res.json({ reply: `You said: "${message}"` });
});

// -----------------------------
// Simple GET for browser test
// -----------------------------
app.get("/", (req, res) => {
  res.send("MCP server is running. POST to /mcp with JSON to interact.");
});

// -----------------------------
// Port
// -----------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
