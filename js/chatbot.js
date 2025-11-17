/**
 * VotEth Hybrid Chatbot
 * Combines rule-based responses with optional AI fallback
 * Professional election assistant with multi-language support
 */

class VotEthChatbot {
    constructor(config = {}) {
        this.knowledgeBase = null;
        this.conversationHistory = [];
        this.isMinimized = true;
        this.aiEnabled = !!config.aiApiKey;
        this.aiProvider = config.aiProvider || 'openai'; // 'openai' or 'gemini'
        this.aiApiKey = config.aiApiKey || null;
        this.currentLanguage = 'en';
        this.isTyping = false;
        
        this.init();
    }

    async init() {
        await this.loadKnowledgeBase();
        this.render();
        this.attachEventListeners();
        this.greetUser();
    }

    async loadKnowledgeBase() {
        try {
            const response = await fetch('/data/chatbot-qa.json');
            this.knowledgeBase = await response.json();
        } catch (error) {
            console.error('Failed to load chatbot knowledge base:', error);
            this.knowledgeBase = this.getFallbackKnowledgeBase();
        }
    }

    getFallbackKnowledgeBase() {
        return {
            categories: {},
            quickActions: [],
            fallbackMessages: ["I'm having trouble loading my knowledge base. Please refresh the page."],
            greetings: ["Hello! I'm experiencing technical difficulties but I'm here to help."]
        };
    }

    render() {
        const chatbotHTML = `
            <div class="voteth-chatbot ${this.isMinimized ? 'minimized' : ''}" id="votethChatbot">
                <!-- Minimized View -->
                <div class="chatbot-minimized" id="chatbotMinimized">
                    <div class="chatbot-bubble">
                        <span class="bubble-icon">💬</span>
                        <span class="bubble-text">Need Help?</span>
                        <span class="notification-badge" id="chatbotBadge" style="display: none;">1</span>
                    </div>
                </div>

                <!-- Expanded View -->
                <div class="chatbot-container" id="chatbotContainer">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="header-info">
                            <span class="chatbot-avatar">🤖</span>
                            <div>
                                <div class="chatbot-title">VotEth Assistant</div>
                                <div class="chatbot-status">
                                    <span class="status-indicator online"></span>
                                    <span class="status-text">Online</span>
                                </div>
                            </div>
                        </div>
                        <div class="header-actions">
                            <button class="header-btn" id="clearChatBtn" title="Clear Chat">
                                🗑️
                            </button>
                            <button class="header-btn" id="minimizeChatBtn" title="Minimize">
                                ➖
                            </button>
                        </div>
                    </div>

                    <!-- Messages Area -->
                    <div class="chatbot-messages" id="chatbotMessages">
                        <!-- Messages will be dynamically added here -->
                    </div>

                    <!-- Quick Actions -->
                    <div class="chatbot-quick-actions" id="chatbotQuickActions">
                        <!-- Quick action buttons will be added here -->
                    </div>

                    <!-- Input Area -->
                    <div class="chatbot-input-container">
                        <textarea 
                            class="chatbot-input" 
                            id="chatbotInput" 
                            placeholder="Type your question..."
                            rows="1"
                        ></textarea>
                        <button class="chatbot-send-btn" id="chatbotSendBtn">
                            <span class="send-icon">📤</span>
                        </button>
                    </div>

                    <!-- Powered By -->
                    <div class="chatbot-footer">
                        <span class="powered-by">
                            ${this.aiEnabled ? '🧠 Hybrid AI Assistant' : '🤖 Rule-Based Assistant'}
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Append to body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = chatbotHTML;
        document.body.appendChild(tempDiv.firstElementChild);
    }

    attachEventListeners() {
        const minimizedView = document.getElementById('chatbotMinimized');
        const minimizeBtn = document.getElementById('minimizeChatBtn');
        const sendBtn = document.getElementById('chatbotSendBtn');
        const inputField = document.getElementById('chatbotInput');
        const clearBtn = document.getElementById('clearChatBtn');

        // Toggle minimize/expand
        minimizedView?.addEventListener('click', () => this.toggleChat());
        minimizeBtn?.addEventListener('click', () => this.toggleChat());

        // Send message
        sendBtn?.addEventListener('click', () => this.handleUserMessage());
        
        // Enter key to send
        inputField?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });

        // Auto-resize textarea
        inputField?.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
        });

        // Clear chat
        clearBtn?.addEventListener('click', () => this.clearChat());

        // Listen for language changes
        if (typeof languageManager !== 'undefined') {
            window.addEventListener('languageChanged', (e) => {
                this.currentLanguage = e.detail.language;
            });
        }
    }

    toggleChat() {
        this.isMinimized = !this.isMinimized;
        const chatbot = document.getElementById('votethChatbot');
        chatbot?.classList.toggle('minimized');

        if (!this.isMinimized) {
            // Focus input when opening
            document.getElementById('chatbotInput')?.focus();
            // Hide notification badge
            const badge = document.getElementById('chatbotBadge');
            if (badge) badge.style.display = 'none';
        }
    }

    greetUser() {
        const greetings = this.knowledgeBase?.greetings || ["Hello! How can I help you?"];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        setTimeout(() => {
            this.addMessage('bot', randomGreeting);
            this.renderQuickActions();
        }, 500);
    }

    renderQuickActions() {
        const container = document.getElementById('chatbotQuickActions');
        if (!container || !this.knowledgeBase?.quickActions) return;

        container.innerHTML = '';
        this.knowledgeBase.quickActions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'quick-action-btn';
            button.textContent = action.label;
            button.addEventListener('click', () => this.handleQuickAction(action));
            container.appendChild(button);
        });
    }

    hideQuickActions() {
        const container = document.getElementById('chatbotQuickActions');
        if (container) {
            container.style.display = 'none';
        }
    }

    showQuickActions() {
        const container = document.getElementById('chatbotQuickActions');
        if (container) {
            container.style.display = 'flex';
        }
    }

    handleQuickAction(action) {
        // Hide quick actions after first use
        this.hideQuickActions();
        
        // Add user message
        this.addMessage('user', action.label);
        
        // Parse response ID (e.g., "voting/v1")
        const [category, id] = action.response.split('/');
        
        // Find and display the answer
        const categoryData = this.knowledgeBase.categories[category];
        if (categoryData) {
            const faq = categoryData.faqs.find(f => f.id === id);
            if (faq) {
                setTimeout(() => {
                    this.addMessage('bot', faq.answer);
                }, 300);
                return;
            }
        }
        
        this.addMessage('bot', "Sorry, I couldn't find that information.");
    }

    async handleUserMessage() {
        const inputField = document.getElementById('chatbotInput');
        const message = inputField?.value.trim();

        if (!message) return;

        // Hide quick actions after first message
        this.hideQuickActions();
        
        // Add user message
        this.addMessage('user', message);
        inputField.value = '';
        inputField.style.height = 'auto';

        // Show typing indicator
        this.showTyping();

        // Process message
        await this.processMessage(message);
    }

    async processMessage(message) {
        // Try rule-based response first
        const ruleBasedResponse = this.findRuleBasedResponse(message);

        if (ruleBasedResponse) {
            setTimeout(() => {
                this.hideTyping();
                this.addMessage('bot', ruleBasedResponse.answer, ruleBasedResponse);
            }, 500);
        } else if (this.aiEnabled) {
            // Fallback to AI
            const aiResponse = await this.getAIResponse(message);
            this.hideTyping();
            this.addMessage('bot', aiResponse, null, true);
        } else {
            // No AI, use fallback message
            setTimeout(() => {
                this.hideTyping();
                const fallbacks = this.knowledgeBase?.fallbackMessages || ["I'm not sure about that."];
                const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                this.addMessage('bot', fallback);
            }, 500);
        }
    }

    findRuleBasedResponse(query) {
        if (!this.knowledgeBase?.categories) return null;

        const normalizedQuery = query.toLowerCase();
        let bestMatch = null;
        let bestScore = 0;

        // Search through all categories
        Object.values(this.knowledgeBase.categories).forEach(category => {
            category.faqs.forEach(faq => {
                // Check keywords
                const keywordMatches = faq.keywords.filter(keyword => 
                    normalizedQuery.includes(keyword.toLowerCase())
                ).length;

                // Check question similarity
                const questionWords = faq.question.toLowerCase().split(' ');
                const questionMatches = questionWords.filter(word => 
                    normalizedQuery.includes(word) && word.length > 3
                ).length;

                const score = (keywordMatches * 2) + questionMatches;

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = faq;
                }
            });
        });

        // Return match if score is good enough
        return bestScore >= 2 ? bestMatch : null;
    }

    async getAIResponse(message) {
        try {
            if (this.aiProvider === 'openai') {
                return await this.getOpenAIResponse(message);
            } else if (this.aiProvider === 'gemini') {
                return await this.getGeminiResponse(message);
            }
        } catch (error) {
            console.error('AI API Error:', error);
            return "I'm having trouble connecting to my AI assistant. Please try a simpler question or rephrase your query.";
        }
    }

    async getOpenAIResponse(message) {
        const systemPrompt = this.buildSystemPrompt();
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.aiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...this.conversationHistory.slice(-6), // Last 6 messages for context
                    { role: 'user', content: message }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "I couldn't generate a response.";
    }

    async getGeminiResponse(message) {
        const systemPrompt = this.buildSystemPrompt();
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.aiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nUser: ${message}\nAssistant:`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300
                }
            })
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    }

    buildSystemPrompt() {
        return `You are a helpful assistant for VotEth, a decentralized blockchain voting platform. 

KEY INFORMATION:
- VotEth runs on Ethereum Sepolia testnet
- Users vote using MetaMask wallet
- Each wallet can vote only once
- Votes are permanent and public on blockchain
- Contract address: 0x50bc25f0878B5081Bf00870643C74DDe6df64756
- Supported languages: English, Hindi, Gujarati, Marathi
- Features: QR codes, analytics dashboard, real-time results

GUIDELINES:
- Be concise (2-3 sentences max)
- Be helpful and professional
- If you don't know, suggest asking election administrator
- Focus on voting process, wallet setup, and troubleshooting
- Never make up technical details
- Encourage users to check official documentation

Respond helpfully to the user's question about VotEth voting platform.`;
    }

    addMessage(sender, text, metadata = null, isAI = false) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message ${isAI ? 'ai-message' : ''}`;

        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-content">
                ${sender === 'bot' ? '<span class="message-avatar">🤖</span>' : ''}
                <div class="message-bubble">
                    <div class="message-text">${this.escapeHtml(text)}</div>
                    <div class="message-time">${timestamp}</div>
                    ${isAI ? '<span class="ai-badge">AI</span>' : ''}
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save to conversation history
        if (sender === 'user') {
            this.conversationHistory.push({ role: 'user', content: text });
        } else {
            this.conversationHistory.push({ role: 'assistant', content: text });
        }

        // Show notification if minimized
        if (this.isMinimized && sender === 'bot') {
            const badge = document.getElementById('chatbotBadge');
            if (badge) badge.style.display = 'flex';
        }
    }

    showTyping() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <span class="message-avatar">🤖</span>
                <div class="message-bubble">
                    <div class="typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.isTyping = true;
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    clearChat() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        this.conversationHistory = [];
        this.showQuickActions();
        this.greetUser();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chatbot when DOM is loaded
let votethChatbot;

document.addEventListener('DOMContentLoaded', () => {
    // Check if AI API key is configured
    const aiConfig = {
        // Set these values or leave empty for rule-based only
        aiProvider: window.CHATBOT_AI_PROVIDER || null, // 'openai' or 'gemini'
        aiApiKey: window.CHATBOT_AI_KEY || null
    };

    votethChatbot = new VotEthChatbot(aiConfig);
});
