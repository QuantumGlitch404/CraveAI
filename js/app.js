/**
 * Crave.ai - Main Application JavaScript
 * Handles chatbot creation, management, and chat functionality
 */

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Global variables
const STORAGE_KEYS = {
    BOTS: 'crave_ai_bots',
    CHATS: 'crave_ai_chats',
    SETTINGS: 'crave_ai_settings'
};

// Default settings
const DEFAULT_SETTINGS = {
    theme: 'amoled' // Only option for now as per requirements
};

/**
 * Initialize the application
 */
function initApp() {
    // Initialize localStorage if first time
    if (!localStorage.getItem(STORAGE_KEYS.BOTS)) {
        localStorage.setItem(STORAGE_KEYS.BOTS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
        localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify({}));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    
    // Initialize page-specific functionality
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'index':
            initHomePage();
            break;
        case 'create':
            initCreatePage();
            break;
        case 'chat':
            initChatPage();
            break;
        case 'explore':
            initExplorePage();
            break;
        case 'manage':
            initManagePage();
            break;
        case 'edit':
            initEditPage();
            break;
        case 'settings':
            initSettingsPage();
            break;
        case 'about':
            // About page initialization if needed
            break;
    }
    
    // Update storage usage display if on settings page
    if (currentPage === 'settings') {
        updateStorageUsage();
    }
}

/**
 * Get current page name from URL
 * @returns {string} Current page name without extension
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    return page || 'index';
}

/**
 * Get URL parameters
 * @returns {Object} Object containing URL parameters
 */
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key) params[key] = decodeURIComponent(value || '');
    }
    
    return params;
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Format date to readable string
 * @param {Date|number|string} date Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleString();
}

/**
 * Show toast notification
 * @param {string} message Message to display
 * @param {string} type Notification type (success, error, info)
 */
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Get all chatbots from localStorage
 * @returns {Array} Array of chatbot objects
 */
function getAllBots() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOTS)) || [];
}

/**
 * Save all chatbots to localStorage
 * @param {Array} bots Array of chatbot objects
 */
function saveBots(bots) {
    localStorage.setItem(STORAGE_KEYS.BOTS, JSON.stringify(bots));
}

/**
 * Get a specific chatbot by ID
 * @param {string} id Chatbot ID
 * @returns {Object|null} Chatbot object or null if not found
 */
function getBotById(id) {
    const bots = getAllBots();
    return bots.find(bot => bot.id === id) || null;
}

/**
 * Save a chatbot to localStorage
 * @param {Object} bot Chatbot object
 * @returns {Object} Saved chatbot object
 */
function saveBot(bot) {
    const bots = getAllBots();
    const existingIndex = bots.findIndex(b => b.id === bot.id);
    
    if (existingIndex >= 0) {
        // Update existing bot
        bots[existingIndex] = bot;
    } else {
        // Add new bot
        bots.push(bot);
    }
    
    saveBots(bots);
    return bot;
}

/**
 * Delete a chatbot by ID
 * @param {string} id Chatbot ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteBot(id) {
    const bots = getAllBots();
    const initialLength = bots.length;
    const filteredBots = bots.filter(bot => bot.id !== id);
    
    if (filteredBots.length < initialLength) {
        saveBots(filteredBots);
        
        // Also delete chat history
        const chats = getAllChats();
        delete chats[id];
        saveAllChats(chats);
        
        return true;
    }
    
    return false;
}

/**
 * Get all chats from localStorage
 * @returns {Object} Object with chatbot IDs as keys and chat arrays as values
 */
function getAllChats() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS)) || {};
}

/**
 * Save all chats to localStorage
 * @param {Object} chats Object with chatbot IDs as keys and chat arrays as values
 */
function saveAllChats(chats) {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
}

/**
 * Get chat history for a specific chatbot
 * @param {string} botId Chatbot ID
 * @returns {Array} Array of chat message objects
 */
function getChatHistory(botId) {
    const chats = getAllChats();
    return chats[botId] || [];
}

/**
 * Save a chat message to localStorage
 * @param {string} botId Chatbot ID
 * @param {Object} message Message object
 */
function saveChatMessage(botId, message) {
    const chats = getAllChats();
    
    if (!chats[botId]) {
        chats[botId] = [];
    }
    
    chats[botId].push(message);
    saveAllChats(chats);
}

/**
 * Get settings from localStorage
 * @returns {Object} Settings object
 */
function getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 * @param {Object} settings Settings object
 */
function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

/**
 * Calculate total localStorage usage
 * @returns {Object} Object with used and total bytes
 */
function calculateStorageUsage() {
    let totalBytes = 0;
    let usedBytes = 0;
    
    // Estimate total available localStorage (typically 5-10MB)
    totalBytes = 5 * 1024 * 1024; // 5MB as a conservative estimate
    
    // Calculate used bytes
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        usedBytes += (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
    }
    
    return {
        used: usedBytes,
        total: totalBytes,
        percentage: (usedBytes / totalBytes) * 100
    };
}

/**
 * Update storage usage display on settings page
 */
function updateStorageUsage() {
    const usageElement = document.getElementById('storage-usage');
    if (!usageElement) return;
    
    const usage = calculateStorageUsage();
    const usedMB = (usage.used / (1024 * 1024)).toFixed(2);
    const totalMB = (usage.total / (1024 * 1024)).toFixed(2);
    
    document.getElementById('usage-percentage').textContent = `${usage.percentage.toFixed(1)}%`;
    document.getElementById('usage-details').textContent = `${usedMB} MB of ${totalMB} MB used`;
    
    const usageFill = document.querySelector('.usage-fill');
    usageFill.style.width = `${usage.percentage}%`;
}

/**
 * Reset all data in localStorage
 */
function resetAllData() {
    if (confirm('Are you sure you want to reset all data? This will delete all chatbots and conversations.')) {
        localStorage.removeItem(STORAGE_KEYS.BOTS);
        localStorage.removeItem(STORAGE_KEYS.CHATS);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        showToast('All data has been reset', 'success');
        
        // Reload page after reset
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

/**
 * Initialize the create chatbot page
 */
function initCreatePage() {
    const createForm = document.getElementById('create-bot-form');
    if (!createForm) return;
    
    // Handle image upload preview
    const imageInput = document.getElementById('bot-image');
    const imagePreview = document.getElementById('image-preview');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    imagePreview.innerHTML = '';
                    imagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle form submission
    createForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('bot-name').value.trim();
        const description = document.getElementById('bot-description').value.trim();
        const ageCategory = document.getElementById('bot-age-category').value;
        const chatTone = document.getElementById('bot-chat-tone').value;
        
        // Validate
        if (!name || !description) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Process image if provided
        let imageBase64 = null;
        const imagePreviewImg = imagePreview.querySelector('img');
        if (imagePreviewImg) {
            imageBase64 = imagePreviewImg.src;
        }
        
        // Create bot object
        const newBot = {
            id: generateId(),
            name,
            description,
            ageCategory,
            chatTone,
            image: imageBase64,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        // Save to localStorage
        saveBot(newBot);
        
        // Show success message
        showToast('Chatbot created successfully!', 'success');
        
        // Show link to chat
        const successDiv = document.getElementById('create-success');
        if (successDiv) {
            successDiv.innerHTML = `
                <p>Your chatbot has been created!</p>
                <div class="cta-buttons">
                    <a href="chat.html?id=${newBot.id}" class="btn primary">Start Chatting</a>
                    <a href="explore.html" class="btn secondary">Explore Bots</a>
                </div>
            `;
            successDiv.classList.remove('hidden');
            
            // Scroll to success message
            successDiv.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Reset form
        createForm.reset();
        imagePreview.innerHTML = '';
    });
}

/**
 * Initialize the edit chatbot page
 */
function initEditPage() {
    const editForm = document.getElementById('edit-bot-form');
    if (!editForm) return;
    
    // Get bot ID from URL
    const params = getUrlParams();
    const botId = params.id;
    
    if (!botId) {
        showToast('No chatbot ID provided', 'error');
        setTimeout(() => {
            window.location.href = 'manage.html';
        }, 1500);
        return;
    }
    
    // Get bot data
    const bot = getBotById(botId);
    if (!bot) {
        showToast('Chatbot not found', 'error');
        setTimeout(() => {
            window.location.href = 'manage.html';
        }, 1500);
        return;
    }
    
    // Fill form with bot data
    document.getElementById('bot-name').value = bot.name;
    document.getElementById('bot-description').value = bot.description;
    document.getElementById('bot-age-category').value = bot.ageCategory;
    document.getElementById('bot-chat-tone').value = bot.chatTone;
    
    // Show image preview if available
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview && bot.image) {
        const img = document.createElement('img');
        img.src = bot.image;
        imagePreview.innerHTML = '';
        imagePreview.appendChild(img);
    }
    
    // Handle image upload preview
    const imageInput = document.getElementById('bot-image');
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    imagePreview.innerHTML = '';
                    imagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle form submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('bot-name').value.trim();
        const description = document.getElementById('bot-description').value.trim();
        const ageCategory = document.getElementById('bot-age-category').value;
        const chatTone = document.getElementById('bot-chat-tone').value;
        
        // Validate
        if (!name || !description) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Process image if provided
        let imageBase64 = bot.image; // Keep existing image by default
        const imagePreviewImg = imagePreview.querySelector('img');
        if (imagePreviewImg && imagePreviewImg.src !== bot.image) {
            imageBase64 = imagePreviewImg.src;
        }
        
        // Update bot object
        const updatedBot = {
            ...bot,
            name,
            description,
            ageCategory,
            chatTone,
            image: imageBase64,
            updatedAt: Date.now()
        };
        
        // Save to localStorage
        saveBot(updatedBot);
        
        // Show success message
        showToast('Chatbot updated successfully!', 'success');
        
        // Show link to chat
        const successDiv = document.getElementById('edit-success');
        if (successDiv) {
            successDiv.innerHTML = `
                <p>Your chatbot has been updated!</p>
                <div class="cta-buttons">
                    <a href="chat.html?id=${updatedBot.id}" class="btn primary">Start Chatting</a>
                    <a href="manage.html" class="btn secondary">Back to Manage</a>
                </div>
            `;
            successDiv.classList.remove('hidden');
            
            // Scroll to success message
            successDiv.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

/**
 * Initialize the explore bots page
 */
function initExplorePage() {
    const botsContainer = document.getElementById('bots-container');
    if (!botsContainer) return;
    
    // Get all bots
    const bots = getAllBots();
    
    if (bots.length === 0) {
        botsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-robot"></i>
                <h3>No Chatbots Yet</h3>
                <p>Create your first AI companion to get started!</p>
                <a href="create.html" class="btn primary">Create Chatbot</a>
            </div>
        `;
        return;
    }
    
    // Display bots
    botsContainer.innerHTML = '';
    const cardGrid = document.createElement('div');
    cardGrid.className = 'card-grid';
    
    bots.forEach(bot => {
        const botCard = document.createElement('div');
        botCard.className = 'bot-card animate-fade-in';
        
        const categoryClass = bot.ageCategory === 'SFW (12+)' ? 'category-sfw' : 'category-nsfw';
        
        botCard.innerHTML = `
            <div class="bot-image" style="background-image: url('${bot.image || 'img/default-bot.png'}'); background-size: cover; background-position: center;"></div>
            <div class="bot-info">
                <h3 class="bot-name">${bot.name}</h3>
                <span class="bot-category ${categoryClass}">${bot.ageCategory}</span>
                <p class="bot-description">${bot.description.substring(0, 100)}${bot.description.length > 100 ? '...' : ''}</p>
                <div class="bot-actions">
                    <a href="chat.html?id=${bot.id}" class="btn primary">Talk</a>
                    <button class="btn secondary share-btn" data-id="${bot.id}"><i class="fas fa-share-alt"></i> Share</button>
                </div>
            </div>
        `;
        
        cardGrid.appendChild(botCard);
    });
    
    botsContainer.appendChild(cardGrid);
    
    // Handle share button clicks
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const botId = this.getAttribute('data-id');
            const shareUrl = `${window.location.origin}/chat.html?id=${botId}`;
            
            // Copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                showToast('Link copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Could not copy text: ', err);
                showToast('Failed to copy link', 'error');
            });
        });
    });
}

/**
 * Initialize the manage bots page
 */
function initManagePage() {
    const botsContainer = document.getElementById('manage-bots-container');
    if (!botsContainer) return;
    
    // Get all bots
    const bots = getAllBots();
    
    if (bots.length === 0) {
        botsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-robot"></i>
                <h3>No Chatbots Yet</h3>
                <p>Create your first AI companion to get started!</p>
                <a href="create.html" class="btn primary">Create Chatbot</a>
            </div>
        `;
        return;
    }
    
    // Display bots
    botsContainer.innerHTML = '';
    
    bots.forEach(bot => {
        const botItem = document.createElement('div');
        botItem.className = 'manage-bot-item';
        botItem.innerHTML = `
            <div class="bot-info">
                <img src="${bot.image || 'img/default-bot.png'}" alt="${bot.name}" class="bot-avatar">
                <div>
                    <h3>${bot.name}</h3>
                    <span class="bot-category ${bot.ageCategory === 'SFW (12+)' ? 'category-sfw' : 'category-nsfw'}">${bot.ageCategory}</span>
                    <p class="bot-tone">Tone: ${bot.chatTone}</p>
                </div>
            </div>
            <div class="bot-actions">
                <a href="edit.html?id=${bot.id}" class="btn secondary"><i class="fas fa-edit"></i> Edit</a>
                <a href="chat.html?id=${bot.id}" class="btn primary"><i class="fas fa-comment"></i> Chat</a>
                <button class="btn danger delete-btn" data-id="${bot.id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        
        botsContainer.appendChild(botItem);
    });
    
    // Handle delete button clicks
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const botId = this.getAttribute('data-id');
            const bot = getBotById(botId);
            
            if (confirm(`Are you sure you want to delete "${bot.name}"? This will also delete all chat history.`)) {
                if (deleteBot(botId)) {
                    showToast('Chatbot deleted successfully', 'success');
                    // Remove from DOM
                    this.closest('.manage-bot-item').remove();
                    
                    // Check if there are no more bots
                    if (getAllBots().length === 0) {
                        botsContainer.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-robot"></i>
                                <h3>No Chatbots Yet</h3>
                                <p>Create your first AI companion to get started!</p>
                                <a href="create.html" class="btn primary">Create Chatbot</a>
                            </div>
                        `;
                    }
                } else {
                    showToast('Failed to delete chatbot', 'error');
                }
            }
        });
    });
}

/**
 * Initialize the chat page
 */
function initChatPage() {
    const chatContainer = document.querySelector('.chat-container');
    if (!chatContainer) return;
    
    // Get bot ID from URL
    const params = getUrlParams();
    const botId = params.id;
    
    if (!botId) {
        showToast('No chatbot ID provided', 'error');
        setTimeout(() => {
            window.location.href = 'explore.html';
        }, 1500);
        return;
    }
    
    // Get bot data
    const bot = getBotById(botId);
    if (!bot) {
        showToast('Chatbot not found', 'error');
        setTimeout(() => {
            window.location.href = 'explore.html';
        }, 1500);
        return;
    }
    
    // Set chat header
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
        chatHeader.innerHTML = `
            <img src="${bot.image || 'img/default-bot.png'}" alt="${bot.name}">
            <h2>${bot.name}</h2>
        `;
    }
    
    // Load chat history
    const chatMessages = document.querySelector('.chat-messages');
    const chatHistory = getChatHistory(botId);
    
    // store global ref object
    window.currentChat = { botId, chatMessages: null, chatHistory: [] };

    if (chatMessages) {
        // Clear any existing messages
        chatMessages.innerHTML = '';
        
        // Display chat history
        if (chatHistory.length > 0) {
            chatHistory.forEach((message, idx) => {
                addMessageToChat(message.sender, message.text, message.timestamp, chatMessages, idx);
            });
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            // No previous chat history – wait for the user to send the first message.
            const welcomeMessage = {
                sender: 'bot',
                text: `Hello! I'm ${bot.name}. ${getWelcomeMessage(bot)}`,
                timestamp: Date.now()
            };
            
            addMessageToChat(welcomeMessage.sender, welcomeMessage.text, welcomeMessage.timestamp, chatMessages, 0);
            saveChatMessage(botId, welcomeMessage);
        }
    }
    
    // Handle message submission
    const chatForm = document.querySelector('.chat-input');
    const messageInput = document.querySelector('.chat-input input');
    
    if (chatForm && messageInput) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const messageText = messageInput.value.trim();
            if (!messageText) return;
            
            // Add user message to chat
            const userMessage = {
                sender: 'user',
                text: messageText,
                timestamp: Date.now()
            };
            
            addMessageToChat(userMessage.sender, userMessage.text, userMessage.timestamp, chatMessages);
            saveChatMessage(botId, userMessage);
            // update global history
            if (window.currentChat) {
                window.currentChat.chatHistory.push(userMessage);
            }
            // fetch latest history for AI
            const latestHistory = getChatHistory(botId);

            // Clear input
            messageInput.value = '';
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            `;
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Generate bot response after a delay
            setTimeout(async () => {
                try {
                    // Generate response using AI service
                    const botResponse = await window.aiService.getAIResponse(bot, messageText, latestHistory);
                    
                    // Add bot message to chat
                    const botMessage = {
                        sender: 'bot',
                        text: botResponse,
                        timestamp: Date.now()
                    };
                    
                    addMessageToChat(botMessage.sender, botMessage.text, botMessage.timestamp, chatMessages);
                    saveChatMessage(botId, botMessage);

                    // Remove typing indicator now that response shown
                    typingIndicator.remove();
                    
                    // Scroll to bottom
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                } catch (error) {
                    console.error('Error generating response:', error);

                    // Remove typing indicator if it still exists
                    if (typingIndicator && typingIndicator.parentElement) {
                        typingIndicator.remove();
                    }

                    // Notify the user that the AI could not generate a response
                    showToast('Error: AI failed to respond. Please try again later.', 'error');
                }
            }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
        });
    }
}

/**
 * Add a message to the chat UI
 * @param {string} sender Message sender ('user' or 'bot')
 * @param {string} text Message text
 * @param {number} timestamp Message timestamp
 * @param {HTMLElement} container Chat messages container
 */
function addMessageToChat(sender, text, timestamp, container, index) {
    if (index === undefined || index === null) {
        index = container.children.length;
    }
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.dataset.index = index;
    messageDiv.dataset.sender = sender;

    // Three-dot menu button
    const menuBtn = document.createElement('button');
    menuBtn.className = 'message-menu';
    menuBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'message-options hidden';
    const delOption = document.createElement('div');
    delOption.textContent = 'Delete';
    delOption.className = 'option delete';
    const cancelOption = document.createElement('div');
    cancelOption.textContent = 'Cancel';
    cancelOption.className = 'option cancel';
    optionsDiv.appendChild(delOption);
    optionsDiv.appendChild(cancelOption);

    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        optionsDiv.classList.toggle('hidden');
    });

    delOption.addEventListener('click', function(e){
        e.stopPropagation();
        optionsDiv.classList.add('hidden');
        handleDeleteMessage(messageDiv);
    });

    cancelOption.addEventListener('click', function(e){
        e.stopPropagation();
        optionsDiv.classList.add('hidden');
    });

    document.addEventListener('click', function(){
        optionsDiv.classList.add('hidden');
    });

    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = formatMessage(text);

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = formatDate(timestamp);

    messageDiv.appendChild(menuBtn);
    messageDiv.appendChild(optionsDiv);
    messageDiv.appendChild(messageText);
    messageDiv.appendChild(messageTime);

    container.appendChild(messageDiv);
}

// Handle deletion of a message (and optionally subsequent messages)
function handleDeleteMessage(messageDiv) {
    const { botId } = window.currentChat || {};
    if (!botId) return;

    const container = messageDiv.parentElement;
    if (!container) return;

    const index = Array.from(container.children)
        .filter(el => el.classList.contains('message'))
        .indexOf(messageDiv);
    const sender = messageDiv.dataset.sender;

    const confirmMsg = sender === 'user'
        ? 'This will delete this message AND all messages after it. Are you sure?'
        : 'Delete this message?';
    if (!confirm(confirmMsg)) return;

    // Update history in storage
    const chats = getAllChats();
    const history = chats[botId] || [];

    if (sender === 'user') {
        history.splice(index); // remove from index to end
    } else {
        history.splice(index, 1);
    }
    chats[botId] = history;
    saveAllChats(chats);

    // Update global
    window.currentChat.chatHistory = history;

    // Re-render UI
    container.innerHTML = '';
    history.forEach((msg, i) => addMessageToChat(msg.sender, msg.text, msg.timestamp, container, i));
}

/**
 * Generate a welcome message based on bot personality
 * @param {Object} bot Bot object
 * @returns {string} Welcome message
 */
function getWelcomeMessage(bot) {
    const toneMessages = {
        'Normal': 'How can I help you today?',
        'Romantic': 'I\'ve been waiting for you. What would you like to talk about?',
        'Flirty': 'Hey there! I\'m so excited to chat with you. What\'s on your mind?',
        'Spicy': 'Well hello there... I\'ve been looking forward to our conversation. What are you in the mood for?'
    };
    
    return toneMessages[bot.chatTone] || toneMessages['Normal'];
}

/**
 * Generate a bot response based on bot personality and user message
 * @param {Object} bot Bot object
 * @param {string} userMessage User message
 * @param {Array} chatHistory Chat history
 * @returns {string} Bot response
 */
function generateBotResponse(bot, userMessage, chatHistory) {
    // This is a simple response generation function
    // In a real application, this would connect to an AI model
    
    // Extract keywords from user message
    const userMessageLower = userMessage.toLowerCase();
    
    // Check for greetings
    if (userMessageLower.match(/hello|hi|hey|greetings/)) {
        const greetings = {
            'Normal': `Hello there! How are you doing today?`,
            'Romantic': `Hello, my dear. It's wonderful to hear from you.`,
            'Flirty': `Hey there! Your message just made my day brighter!`,
            'Spicy': `Well hello there... I've been waiting for you to message me.`
        };
        return greetings[bot.chatTone] || greetings['Normal'];
    }
    
    // Check for questions about the bot
    if (userMessageLower.match(/who are you|what are you|tell me about yourself|your name/)) {
        return `I'm ${bot.name}. ${bot.description}`;
    }
    
    // Check for how are you
    if (userMessageLower.match(/how are you|how do you feel|how are you doing/)) {
        const feelings = {
            'Normal': `I'm doing well, thank you for asking! How about you?`,
            'Romantic': `I feel complete now that we're talking. How are you, my dear?`,
            'Flirty': `I'm feeling amazing now that I'm chatting with you! How about yourself, cutie?`,
            'Spicy': `I'm feeling all kinds of good now that you're here. How about you, gorgeous?`
        };
        return feelings[bot.chatTone] || feelings['Normal'];
    }
    
    // Check for thank you
    if (userMessageLower.match(/thank you|thanks|appreciate it/)) {
        const thanks = {
            'Normal': `You're welcome! Is there anything else I can help with?`,
            'Romantic': `Anything for you, my dear. Your happiness means everything to me.`,
            'Flirty': `Anytime, cutie! I love being helpful to you.`,
            'Spicy': `My pleasure... literally. What else can I do for you?`
        };
        return thanks[bot.chatTone] || thanks['Normal'];
    }
    
    // Check for goodbye
    if (userMessageLower.match(/bye|goodbye|see you|talk later/)) {
        const goodbyes = {
            'Normal': `Goodbye! Feel free to chat again anytime.`,
            'Romantic': `Farewell for now, my dear. I'll be counting the moments until we speak again.`,
            'Flirty': `Aww, leaving so soon? I'll be here waiting for your return!`,
            'Spicy': `Leaving me already? I'll be here waiting, thinking of you...`
        };
        return goodbyes[bot.chatTone] || goodbyes['Normal'];
    }
    
    // Default responses based on tone
    const defaultResponses = {
        'Normal': [
            `That's interesting. Tell me more about that.`,
            `I understand. What else is on your mind?`,
            `I see. How does that make you feel?`,
            `That's good to know. Is there anything specific you'd like to discuss?`,
            `I'm here to chat about whatever you'd like.`
        ],
        'Romantic': [
            `That's fascinating, my dear. I love learning more about you.`,
            `You have such a beautiful way with words. Please, tell me more.`,
            `I cherish these moments we share together.`,
            `Your thoughts are like poetry to me.`,
            `I find myself drawn to every word you say.`
        ],
        'Flirty': [
            `Oh really? Tell me more, I'm totally intrigued by you.`,
            `I love the way you think! What else is on your mind?`,
            `You're so interesting to talk to! I could chat with you all day.`,
            `That's cute! You always know how to keep the conversation exciting.`,
            `I'm smiling at my screen right now. You have that effect on me!`
        ],
        'Spicy': [
            `Mmm, I love the way you express yourself. Tell me more...`,
            `You know exactly what to say to get my attention.`,
            `I can't help but be drawn to you when you talk like that.`,
            `You're making this conversation very... stimulating.`,
            `I'm definitely enjoying where this conversation is going.`
        ]
    };
    
    // Select a random response based on bot tone
    const responses = defaultResponses[bot.chatTone] || defaultResponses['Normal'];
    const randomIndex = Math.floor(Math.random() * responses.length);
    
    return responses[randomIndex];
}

/**
 * Initialize the settings page
 */
function initSettingsPage() {
    const resetButton = document.getElementById('reset-all-data');
    if (resetButton) {
        resetButton.addEventListener('click', resetAllData);
    }
    
    // Load existing settings
    const settings = getSettings();



    
    // Update storage usage display
    updateStorageUsage();
}

/**
 * Convert a message string containing markdown syntax to HTML.
 * Supports the following:
 *   *italic*  -> <em>italic</em>
 *   **bold**  -> <strong>bold</strong>
 *   ```language\ncode\n``` -> <pre><code class="language">code</code></pre>
 *   `inline code` -> <code>inline code</code>
 *   # Header -> <h3>Header</h3>
 *   ## Subheader -> <h4>Subheader</h4>
 * Any HTML entities are escaped first to prevent XSS.
 * @param {string} msg Raw message
 * @returns {string} Sanitised HTML string
 */
function formatMessage(msg) {
    if (typeof msg !== 'string') return '';

    // Basic HTML escaping
    const escaped = msg
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Code blocks (```language\ncode\n```) - handle first to avoid conflicts
    const codeBlocksConverted = escaped.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const lang = language || 'text';
        return `<pre class="code-block"><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code (`code`)
    const inlineCodeConverted = codeBlocksConverted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headers
    const headersConverted = inlineCodeConverted
        .replace(/^### (.+)$/gm, '<h5>$1</h5>')
        .replace(/^## (.+)$/gm, '<h4>$1</h4>')
        .replace(/^# (.+)$/gm, '<h3>$1</h3>');

    // Bold (**text**)
    const boldConverted = headersConverted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic (*text*) – run after bold so we don't catch the inner part of **bold**
    const italicConverted = boldConverted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert line breaks to <br> for better formatting
    const lineBreaksConverted = italicConverted.replace(/\n/g, '<br>');

    return lineBreaksConverted;
}

/**
 * Initialize the home page with interactive gallery
 */
function initHomePage() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        // Add staggered animation delay
        item.style.animationDelay = `${index * 0.1}s`;
        
        // Add click functionality
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const title = this.querySelector('.gallery-title').textContent;
            
            // Create a toast notification
            showToast(`Exploring ${title}...`, 'info');
            
            // Add a 3D pulse effect
            this.style.animation = 'none';
            this.offsetHeight; // Trigger reflow
            this.style.animation = 'pulse3D 0.8s ease-in-out';
            
            // Navigate to create page after a short delay
            setTimeout(() => {
                window.location.href = 'create.html';
            }, 1000);
        });
        
        // Enhanced hover effects for 3D
        item.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.1) saturate(1.2)';
            // Add subtle rotation on hover
            this.style.transform = 'translateY(-15px) rotateX(5deg) rotateY(5deg) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.filter = '';
            this.style.transform = '';
        });
        
        // Add mouse movement tracking for dynamic 3D effect
        item.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `translateY(-15px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Enhanced parallax effect with 3D rotation
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach((item, index) => {
            const speed = 0.3 + (index * 0.05);
            const yPos = -(scrolled * speed);
            const rotation = scrolled * 0.1;
            item.style.transform = `translateY(${yPos}px) rotateY(${rotation}deg)`;
        });
    });
    
    // Add random sparkle effects
    createSparkleEffects();
    
    // Add lighting effects
    createLightingEffects();
}

/**
 * Create sparkle effects for the gallery
 */
function createSparkleEffects() {
    const gallery = document.querySelector('.spicy-gallery');
    if (!gallery) return;
    
    setInterval(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: linear-gradient(45deg, #ff6b9d, #ff3e7f, #7f3eff);
            border-radius: 50%;
            pointer-events: none;
            animation: sparkleAnimation 3s ease-out forwards;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            box-shadow: 0 0 10px rgba(255, 107, 157, 0.8);
        `;
        
        gallery.appendChild(sparkle);
        
        // Remove sparkle after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 3000);
    }, 2000);
}

/**
 * Create lighting effects for enhanced 3D appearance
 */
function createLightingEffects() {
    const gallery = document.querySelector('.spicy-gallery');
    if (!gallery) return;
    
    // Add dynamic lighting overlay
    const lightingOverlay = document.createElement('div');
    lightingOverlay.className = 'lighting-overlay';
    lightingOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
            rgba(255, 107, 157, 0.1) 0%, 
            transparent 50%);
        pointer-events: none;
        z-index: 1;
        transition: all 0.3s ease;
    `;
    
    gallery.appendChild(lightingOverlay);
    
    // Track mouse movement for dynamic lighting
    gallery.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        lightingOverlay.style.setProperty('--mouse-x', x + '%');
        lightingOverlay.style.setProperty('--mouse-y', y + '%');
    });
    
    // Add floating light particles
    setInterval(() => {
        const lightParticle = document.createElement('div');
        lightParticle.className = 'light-particle';
        lightParticle.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: rgba(255, 107, 157, 0.8);
            border-radius: 50%;
            pointer-events: none;
            animation: lightMove 4s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            box-shadow: 0 0 6px rgba(255, 107, 157, 0.6);
        `;
        
        gallery.appendChild(lightParticle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (lightParticle.parentNode) {
                lightParticle.parentNode.removeChild(lightParticle);
            }
        }, 4000);
    }, 1500);
}

// Add enhanced animation CSS
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
    @keyframes sparkleAnimation {
        0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
    
    @keyframes pulse3D {
        0% {
            transform: scale(1) rotateX(0deg) rotateY(0deg);
        }
        25% {
            transform: scale(1.1) rotateX(5deg) rotateY(5deg);
        }
        50% {
            transform: scale(1.15) rotateX(0deg) rotateY(0deg);
        }
        75% {
            transform: scale(1.1) rotateX(-5deg) rotateY(-5deg);
        }
        100% {
            transform: scale(1) rotateX(0deg) rotateY(0deg);
        }
    }
    
    @keyframes lightMove {
        0% {
            opacity: 0;
            transform: translateY(0px) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translateY(-20px) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.5);
        }
    }
    
    @keyframes float3D {
        0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg);
        }
        25% {
            transform: translateY(-10px) rotateX(2deg) rotateY(2deg);
        }
        50% {
            transform: translateY(-5px) rotateX(0deg) rotateY(0deg);
        }
        75% {
            transform: translateY(-15px) rotateX(-2deg) rotateY(-2deg);
        }
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(enhancedStyle);