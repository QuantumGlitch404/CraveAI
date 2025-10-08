# Crave.ai - Your Personal AI Companion Factory

Crave.ai is a full-featured AI Chatbot Builder platform that allows users to create, customize, manage, and chat with AI chatbots without requiring login or signup. The entire application works locally using browser storage technologies.

## Features

- **Create Custom AI Companions**: Design chatbots with unique personalities, traits, and appearances
- **Dynamic Conversations**: Chat with AI companions that respond based on their personality and tone
- **Real AI integration**: Optional integration with OpenAI API
- **Complete Privacy**: All data stays on your device with no server storage
- **No Login Required**: Use the platform without creating an account
- **Unlimited Creations**: Create as many chatbots as you want
- **Easy Sharing**: Share your creations with others via simple links
- **Dark AMOLED Theme**: Enjoy a sleek, battery-saving dark interface

## Pages

1. **Home Page** (`index.html`): Main landing page with branding and navigation
2. **Create Chatbot Page** (`create.html`): Form to create new AI companions
3. **Chat Page** (`chat.html?id=botID`): Interface for chatting with AI companions
4. **Explore Bots Page** (`explore.html`): Browse all created chatbots
5. **Manage My Bots Page** (`manage.html`): Edit or delete your chatbots
6. **Edit Bot Page** (`edit.html?id=botID`): Update existing chatbots
7. **About Page** (`about.html`): Information about the platform
8. **Settings Page** (`settings.html`): Manage application preferences

## Technology Stack

- **HTML5**: Structure and content
- **CSS3**: Styling with dark AMOLED theme
- **JavaScript (Vanilla)**: Client-side functionality
- **localStorage**: Data persistence
- **OpenAI API Integration**: Optional connection to GPT models for enhanced AI responses

## Setup Instructions

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No additional setup required - everything runs locally in your browser

## Local Storage Usage

Crave.ai uses your browser's localStorage to save:
- Chatbot profiles (name, description, image, settings)
- Conversation history
- Application settings
- OpenAI API key (if provided)

No data is sent to any server except when using the OpenAI API integration. Your API key is stored locally and only used to make requests to OpenAI's servers for generating AI responses.

## Using the AI Integration

1. Get an API key from [OpenAI's website](https://platform.openai.com/api-keys)
2. Go to the Settings page in Crave.ai
3. Enter your API key in the designated field and click "Save Key"
4. Start chatting with your bots to experience enhanced AI responses

Without an API key, the application will fall back to the local response generator, which uses predefined patterns based on the bot's personality.

## Optional Backend Integration

While the application works completely client-side, you can optionally set up a backend for more advanced AI processing:

1. Create a Node.js or Python backend
2. Integrate a lightweight AI model (like llama.cpp)
3. Set up API endpoints for chat message processing
4. Update the `generateBotResponse()` function in `app.js` to call your API

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is available for personal and commercial use.

## Disclaimer

This is a locally-run AI chatbot builder with fictional and potentially mature content. No login, no server storage. User discretion advised.
