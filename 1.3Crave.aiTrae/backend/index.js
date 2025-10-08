import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fetch from 'node-fetch';

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT:  NEVER hard-code your API keys in source code.
// Set the OPENROUTER_API_KEY as an environment variable before starting the server.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = 'openai/gpt-3.5-turbo';

if (!OPENROUTER_API_KEY) {
    console.error('\nERROR: OPENROUTER_API_KEY is not set.');
    console.error('Create a file named .env in the backend directory with:');
    console.error('  OPENROUTER_API_KEY=sk-xxxxxxxxxxxxxxxx');
    console.error('Then run:  npm install   (first time only)');
    console.error('            npm start');
    process.exit(1);
}

// -----------------------------------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------------------------------
app.use(cors());                // Enable CORS for all origins (frontend runs on a different port)
app.use(express.json());        // Parse JSON request bodies

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

// Serve static frontend.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the frontend static files (html, css, js, images)
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for root so browser loads UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});


/**
 * POST /chat
 *
 * Expects JSON body with:
 *   {
 *     "userMessage":   string,  // user input
 *     "systemPrompt":  string   // system prompt/personality
 *   }
 *
 * Returns the raw response from the OpenRouter API so the client can handle it
 * exactly as it expects (choices[0].message.content, etc.).
 */
app.post('/chat', async (req, res) => {
    const { userMessage, systemPrompt } = req.body;

    // Basic validation
    if (typeof userMessage !== 'string' || typeof systemPrompt !== 'string') {
        return res.status(400).json({ error: 'Both "userMessage" and "systemPrompt" must be provided as strings.' });
    }

    // Construct the chat messages array as expected by OpenRouter
    const messages = [
        { 
            role: 'system', 
            content: systemPrompt + "\n\nIMPORTANT: When generating code, use professional formatting:\n- Use proper markdown code blocks with language specification\n- Structure responses clearly with headers and sections\n- Provide clean, well-commented code\n- Use professional language and formatting\n- Format code blocks like: ```language\ncode here\n```\n- Be concise but comprehensive in explanations"
        },
        { role: 'user',   content: userMessage }
    ];

    try {
        // Forward request to OpenRouter
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                // OpenRouter additionally requires either a Referer or X-Title header.
                // See https://openrouter.ai/docs#headers for details.
                'Referer': process.env.OPENROUTER_REFERER || 'http://localhost:3000/',
                'X-Title': 'Crave.ai Chat App'
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages
            })
        });

        // If OpenRouter responded with an error status, provide a fallback response
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);
            console.error('Request details:', { model: AI_MODEL, messages });
            
            // Provide a fallback response instead of error
            const fallbackResponse = {
                id: 'fallback-' + Date.now(),
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: AI_MODEL,
                choices: [{
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: `I'm sorry, I'm having trouble connecting to the AI service right now. This is a fallback response. Your message was: "${userMessage}". Please check your API key configuration.`
                    },
                    finish_reason: 'stop'
                }],
                usage: {
                    prompt_tokens: 10,
                    completion_tokens: 20,
                    total_tokens: 30
                }
            };
            return res.json(fallbackResponse);
        }

        const data = await response.json();
        return res.json(data);
    } catch (err) {
        console.error('Server error while calling OpenRouter:', err);
        
        // Provide a fallback response instead of error
        const fallbackResponse = {
            id: 'fallback-' + Date.now(),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: AI_MODEL,
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: `I'm sorry, I'm experiencing technical difficulties. This is a fallback response. Your message was: "${userMessage}". Please try again later.`
                },
                finish_reason: 'stop'
            }],
            usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30
            }
        };
        return res.json(fallbackResponse);
    }
});

// -----------------------------------------------------------------------------
// START SERVER
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Backend server listening at http://localhost:${PORT}`);
});