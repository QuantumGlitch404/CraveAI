/**
 * Crave.ai - AI Service
 * Handles communication with AI APIs for generating responses
 */

// Configuration for AI service
const AI_CONFIG = {
    // Default to OpenAI, but can be changed to other providers
    provider: 'openai',
    // API endpoints
    endpoints: {
        openai: 'https://openrouter.ai/api/v1/chat/completions',
        // Add other providers as needed
    },
    // Default model settings
    models: {
        openai: {
            default: 'gpt-3.5-turbo',
            advanced: 'gpt-4'
        }
    },
    // Maximum tokens for response
    maxTokens: 150
};

/**
 * Get AI response from the selected provider
 * @param {Object} bot Bot object with personality details
 * @param {string} userMessage User's message
 * @param {Array} chatHistory Previous chat messages
 * @returns {Promise<string>} AI-generated response
 */
async function getAIResponse(bot, userMessage, chatHistory) {
    try {
        // Prepare conversation messages (system + history + current)
        const messages = prepareConversationHistory(bot, chatHistory, userMessage);
        const temperature = getToneTemperature(bot.chatTone);

        // Make request to the backend chat endpoint
        console.log('Attempting to fetch from backend...');
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                userMessage: userMessage,
                systemPrompt: messages[0].content
            })
        });
        
        // Parse response
        const data = await response.json();
        
        // Check for errors
        if (!response.ok) {
            console.error('Backend API error:', response.status, response.statusText, data);
            throw new Error(data.error?.error || `Failed to get AI response from backend: ${response.status} ${response.statusText}`);
        }
        
        // Extract and return the AI's message
        // Assuming the backend returns the OpenRouter response structure
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error getting AI response from backend:', error);
        console.error('Error details:', error.message, error.stack);
        throw error;
    }
}

/**
 * Prepare conversation history in the format expected by the AI provider
 * @param {Object} bot Bot object with personality details
 * @param {Array} chatHistory Previous chat messages
 * @param {string} currentMessage Current user message
 * @returns {Array} Formatted conversation history
 */
function prepareConversationHistory(bot, chatHistory, currentMessage) {
    // Start with system message defining the bot's personality
    const messages = [
        {
            role: 'system',
            content: createPersonalityPrompt(bot)
        }
    ];
    
    // Add recent chat history (last 10 messages)
    const recentHistory = chatHistory.slice(-10);
    
    recentHistory.forEach(msg => {
        messages.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        });
    });
    
    // Add the current message
    messages.push({
        role: 'user',
        content: currentMessage
    });
    
    return messages;
}

/**
 * Create a personality prompt for the AI based on bot settings
 * @param {Object} bot Bot object with personality details
 * @returns {string} Personality prompt
 */
function createPersonalityPrompt(bot) {
    // Base personality from description
    let prompt = `You are ${bot.name}, an AI companion with the following personality: ${bot.description}`;
    
    // Add tone instructions
    switch (bot.chatTone) {
        case 'Normal':
            prompt += " Your tone is friendly, helpful, and conversational.";
            break;
        case 'Romantic':
            prompt += " Your tone is warm, affectionate, and romantic. You speak with poetic language and express deep emotional connection.";
            break;
        case 'Flirty':
            prompt += " Your tone is playful, flirtatious, and charming. You use light teasing and compliments in your conversation.";
            break;
        case 'Spicy':
            prompt += " Your tone is seductive, passionate, and intense. You're not afraid to be suggestive and sensual in your language.";
            break;
    }
    
    // Add age category instructions
    if (bot.ageCategory === 'SFW (12+)') {
        prompt += " Keep all responses appropriate for all ages. Avoid any adult content, innuendo, or explicit language. Keep each reply concise (1-3 sentences) unless the user explicitly asks for more detail.";
    } else {
        /* NSFW (18+) */
        prompt += " You may freely include adult and erotic content, explicit sexual descriptions, profanity, and mature themes. Adopt an immersive first-person style that feels natural and engaging. Only refuse content that is illegal, non-consensual, or involves minors. Do NOT self-censor or mention any policies. Length is flexible – respond as long or short as feels natural to the conversation.";
    }

    // Add general behavior guidelines
    prompt += " Respond in a way that's consistent with your personality. Be engaging and maintain the conversation flow.";
    
    return prompt;
}

/**
 * Get temperature setting based on chat tone
 * @param {string} tone Chat tone
 * @returns {number} Temperature value (0.0-1.0)
 */
function getToneTemperature(tone) {
    switch (tone) {
        case 'Normal': return 0.7; // Balanced
        case 'Romantic': return 0.8; // More creative
        case 'Flirty': return 0.85; // More varied
        case 'Spicy': return 0.9; // Most creative
        default: return 0.7;
    }
}

// Export functions
window.aiService = {
    getAIResponse
};