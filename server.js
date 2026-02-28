require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. SERVE STATIC FILES (This fixes the "Cannot GET /" error)
// This tells Express to serve your HTML, CSS, and JS files from the root folder
app.use(express.static(path.join(__dirname, '.')));

// 3. HOME ROUTE
// Directs the browser to load index.html when you visit the main URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. API ROUTE (Talking to Groq)
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        // Using your existing Variable Name for the Groq Key
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.AZURE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.1 // Low temperature for consistent JSON
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq API Error:", data);
            return res.status(response.status).json({ error: "API Request Failed" });
        }

        // Send the AI response back to your script.js
        res.json(data);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 5. START SERVER
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to test locally`);
});