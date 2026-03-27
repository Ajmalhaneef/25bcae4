const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const frontendPaths = [
  path.join(__dirname, "frontend"),
  path.join(__dirname, "frontend.")
];
const frontendDir = frontendPaths.find(fs.existsSync);
if (!frontendDir) {
  console.error("Frontend folder not found:", frontendPaths);
  process.exit(1);
}
app.use(express.static(frontendDir));

// DB URL check
const connectionString =
  process.env.DATABASE_URL ||
  process.env.RENDER_DATABASE_URL ||
  null;

if (!connectionString) {
  console.error("DATABASE_URL missing. Set it in Render environment variables.");
}

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    })
  : null;

async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (err) {
    console.error("Table creation failed:", err);
  }
}
ensureTables();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/contact", async (req, res) => {
  if (!pool) {
    return res.status(500).json({
      error: "Database is not configured",
      details: "DATABASE_URL is missing in environment variables"
    });
  }

  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)",
      [name, email, message]
    );
    return res.json({ message: "Message received successfully!" });
  } catch (err) {
    console.error("Contact insert error:", err);
    return res.status(500).json({ error: "Error saving message", details: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
