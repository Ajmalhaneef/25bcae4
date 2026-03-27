const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "./frontend.")));

// PostgreSQL Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Ensure table exists
pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
       id SERIAL PRIMARY KEY,
       name TEXT NOT NULL,
       email TEXT NOT NULL,
       message TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
    )
`).catch(err => {
    console.error("Table creation failed:", err);
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        await pool.query(
            "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)",
            [name, email, message]
        );
        res.json({ message: "Message received successfully!" });
    } catch (err) {
        console.error("Contact insert error:", err);
        res.status(500).json({ error: "Error saving message", details: err.message });
    }
});

// SPA fallback (serves frontend index)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./frontend./index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
