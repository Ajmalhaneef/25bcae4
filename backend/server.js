const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend.")));

// PostgreSQL Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Health Check - Remove or modify this to not interfere with static serving
app.get("/api/health", (req, res) => {
    res.send("Server is running!");
});

// Contact Form Endpoint
app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send("All fields are required");
    }

    try {
        await pool.query(
            "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)",
            [name, email, message]
        );
        res.status(200).send("Message received successfully!");
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Error saving message");
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
