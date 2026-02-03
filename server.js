// server.js
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Simple GET health check
app.get("/", (req, res) => {
  res.send("MCP Test Server Running. POST to /mcp with JSON { message: '...' }");
});

// MCP endpoint
app.post("/mcp", (req, res) => {
  console.log("Incoming request body:", req.body);

  const { message } = req.body;

  if (!message) {
    return res.json({ reply: "No message received." });
  }

  // Echo back message for test
  const reply = `Bot received: "${message}"`;
  console.log("Replying with:", reply);

  return res.json({ reply });
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP test server running on port ${PORT}`);
});
