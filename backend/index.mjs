import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = 3000; // You can change this port if needed

// Hardcoded OpenRouter API key
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = 'gryphe/mythomax-l2-13b';

// Enable CORS for all origins
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Chat endpoint
app.post('/chat', async (req, res) => {
    const { messages, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required.' });
    }

    try {
        // use provided messages directly (system+history+current)


        console.log('Making request to OpenRouter with:', {
            model: AI_MODEL,
            messages: messages,
            apiKey: OPENROUTER_API_KEY.substring(0, 5) + '...'
        });

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: messages,
                temperature: temperature || 0.7
            })
        });

        console.log('Fetching OpenRouter with URL:', OPENROUTER_API_URL, 'and options:', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY.substring(0, 5)}...`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: messages,
                temperature: temperature || 0.7
            })
        });

        console.log('Received response from OpenRouter:', response);

        if (!response.ok) {
            const errorText = await response.text(); // Get raw response text
            console.error('OpenRouter API error:', response.status, response.statusText, errorText);
            try {
                const errorData = JSON.parse(errorText);
                return res.status(response.status).json({ error: errorData.message || 'Error from OpenRouter API' });
            } catch (parseError) {
                return res.status(response.status).json({ error: `Error from OpenRouter API: ${errorText}` });
            }
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});