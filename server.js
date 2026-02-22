require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const AZURE_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions";

app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch(AZURE_ENDPOINT, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${process.env.AZURE_AI_TOKEN}` 
            },
            body: JSON.stringify({
                messages: req.body.messages,
                model: "gpt-4o"
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));