import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load trivia
const triviaPath = path.join(__dirname, "trivia.json");
let triviaQuestions = [];
try {
  triviaQuestions = JSON.parse(fs.readFileSync(triviaPath, "utf-8"));
  console.log(`Loaded ${triviaQuestions.length} trivia questions`);
} catch (err) {
  console.error("Error loading trivia.json:", err);
}

const app = express();
app.use(bodyParser.json());

// MCP endpoint
app.post("/mcp", (req, res) => {
  console.log("Incoming message:", req.body);

  const userMessage = req.body.message || "";

  // Simple trivia trigger
  if (/trivia/i.test(userMessage)) {
    const question =
      triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
    res.json({ reply: `Trivia: ${question.question}\nOptions: ${question.options.join(", ")}` });
    console.log("Responded with trivia question");
    return;
  }

  // Default reply
  res.json({ reply: "MCP server received your message: " + userMessage });
  console.log("Responded with default message");
});

// Use Railway PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Test MCP server running at http://localhost:${PORT}`);
});
