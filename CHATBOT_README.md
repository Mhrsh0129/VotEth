# VotEth Hybrid Chatbot System 🤖

## Overview

The VotEth chatbot is an intelligent hybrid assistant that helps users navigate the voting platform, troubleshoot issues, and learn about blockchain voting. It combines rule-based responses with optional AI fallback for maximum flexibility and reliability.

## Features

### ✨ Core Capabilities

- **Rule-Based Q&A**: 30+ pre-configured FAQs covering common questions
- **Smart Keyword Matching**: Intelligent response matching using keywords and question similarity
- **Quick Actions**: One-click buttons for frequently asked questions
- **Multi-Language Ready**: Integrates with i18next translation system
- **AI Fallback (Optional)**: OpenAI or Google Gemini integration for complex queries
- **Conversation History**: Maintains context for natural conversations
- **Theme Support**: Adapts to dark/light mode seamlessly
- **Mobile Responsive**: Full functionality on all device sizes
- **Typing Indicators**: Professional chat UX with animated responses
- **Minimizable Interface**: Non-intrusive floating bubble design

### 📚 Knowledge Categories

1. **Voting Process** 🗳️
   - How to vote, voting rules, cost, anonymity
   
2. **Wallet & Connection** 👛
   - MetaMask setup, testnet ETH, network switching
   
3. **Results & Analytics** 📊
   - Viewing results, real-time updates, data export
   
4. **Technical Info** ⚙️
   - Blockchain details, smart contracts, security
   
5. **Features & Tools** ✨
   - Languages, QR codes, themes, mobile voting
   
6. **Troubleshooting** 🔧
   - Error resolution, common issues, debugging

## File Structure

```
VotEth/
├── data/
│   └── chatbot-qa.json         # Knowledge base with all Q&A pairs
├── js/
│   ├── chatbot.js              # Main chatbot logic
│   └── chatbot-config.js       # Optional AI configuration
└── css/
    └── chatbot.css             # Professional styling
```

## Installation & Setup

### Basic Setup (Rule-Based Only)

The chatbot works out-of-the-box with no configuration needed:

1. Files are already integrated into `index.html`, `ListVoters.html`, and `analytics.html`
2. Knowledge base is loaded from `/data/chatbot-qa.json`
3. Chatbot appears as a floating bubble in the bottom-right corner

### Advanced Setup (AI-Powered)

To enable AI fallback for complex questions:

#### Option 1: OpenAI (GPT-3.5 Turbo)

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open `js/chatbot-config.js`
3. Uncomment and configure:
   ```javascript
   window.CHATBOT_AI_PROVIDER = 'openai';
   window.CHATBOT_AI_KEY = 'sk-your-actual-api-key-here';
   ```

#### Option 2: Google Gemini

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open `js/chatbot-config.js`
3. Uncomment and configure:
   ```javascript
   window.CHATBOT_AI_PROVIDER = 'gemini';
   window.CHATBOT_AI_KEY = 'your-actual-gemini-key-here';
   ```

**⚠️ SECURITY WARNING**: Never commit API keys to version control! For production:
- Use environment variables
- Implement a backend proxy
- Add rate limiting
- Monitor API usage

## How It Works

### Response Flow

```
User Question
      ↓
Rule-Based Matching (Keywords + Question Similarity)
      ↓
  Match Found? ──Yes──→ Return FAQ Answer
      ↓
     No
      ↓
  AI Enabled? ──No──→ Return Fallback Message
      ↓
     Yes
      ↓
OpenAI/Gemini API Call
      ↓
Return AI Response (marked with AI badge)
```

### Rule-Based Matching Algorithm

1. **Normalize Query**: Convert to lowercase
2. **Keyword Matching**: Check against pre-defined keywords (weight: 2x)
3. **Question Similarity**: Match words in question text (weight: 1x)
4. **Score Calculation**: Sum weighted matches
5. **Threshold Check**: Return best match if score ≥ 2

### AI Context Building

When AI is enabled, the system provides:
- **System Prompt**: VotEth context, features, and guidelines
- **Conversation History**: Last 6 messages for context
- **Current Question**: User's query
- **Response Limits**: 300 tokens max, concise answers

## Usage Guide

### For Users

1. **Opening Chatbot**: Click the "Need Help?" bubble in bottom-right
2. **Quick Actions**: Use pre-defined buttons for common questions
3. **Type Questions**: Ask anything in natural language
4. **View History**: Scroll through previous messages
5. **Clear Chat**: Click trash icon to reset conversation
6. **Minimize**: Click minimize button to reduce to bubble

### For Developers

#### Adding New FAQs

Edit `data/chatbot-qa.json`:

```json
{
  "id": "unique_id",
  "question": "Your question here?",
  "answer": "Your detailed answer here.",
  "keywords": ["keyword1", "keyword2", "relevant", "terms"]
}
```

#### Customizing Appearance

Edit `css/chatbot.css`:
- Colors: Modify gradient values
- Size: Adjust `.chatbot-container` dimensions
- Position: Change `bottom`/`right` values
- Animations: Update keyframes

#### Integration in New Pages

```html
<!-- Add to <head> -->
<link rel="stylesheet" href="css/chatbot.css">
<script src="js/chatbot-config.js"></script>
<script src="js/chatbot.js" defer></script>
```

#### Programmatic Control

```javascript
// Access chatbot instance
votethChatbot.toggleChat();           // Open/close
votethChatbot.clearChat();            // Reset conversation
votethChatbot.addMessage('bot', 'Hi'); // Add custom message
```

## API Reference

### VotEthChatbot Class

```javascript
class VotEthChatbot {
  constructor(config = {})
  
  // Methods
  async init()                          // Initialize chatbot
  async loadKnowledgeBase()             // Load Q&A data
  render()                              // Create HTML structure
  toggleChat()                          // Show/hide chatbot
  async handleUserMessage()             // Process user input
  findRuleBasedResponse(query)          // Match FAQ
  async getAIResponse(message)          // Call AI API
  addMessage(sender, text, meta, isAI)  // Add chat message
  clearChat()                           // Reset conversation
}
```

### Configuration Options

```javascript
{
  aiProvider: 'openai' | 'gemini' | null,
  aiApiKey: 'your-api-key' | null
}
```

## Knowledge Base Schema

```json
{
  "categories": {
    "category_id": {
      "name": "Display Name",
      "icon": "🔥",
      "faqs": [
        {
          "id": "unique_id",
          "question": "Question text?",
          "answer": "Answer text.",
          "keywords": ["array", "of", "keywords"]
        }
      ]
    }
  },
  "quickActions": [
    {
      "id": "qa1",
      "label": "Button Text",
      "response": "category/faq_id"
    }
  ],
  "fallbackMessages": ["Array of fallback responses"],
  "greetings": ["Array of greeting messages"]
}
```

## Performance Optimization

- **Lazy Loading**: Chatbot renders only when needed
- **Efficient Matching**: O(n) keyword search across knowledge base
- **Cached Responses**: Rule-based answers load instantly
- **Minimal Bundle**: ~50KB total (CSS + JS + JSON)
- **CDN Dependencies**: Chart.js and i18next from CDN

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML with ARIA labels
- **High Contrast**: Respects system preferences
- **Reduced Motion**: Disables animations when requested
- **Focus Management**: Proper focus handling

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

- [ ] Voice input/output support
- [ ] Sentiment analysis for user satisfaction
- [ ] Admin analytics dashboard
- [ ] Multi-turn conversation threading
- [ ] Proactive help suggestions
- [ ] Integration with blockchain events
- [ ] Chatbot analytics and metrics
- [ ] A/B testing for responses

## Troubleshooting

### Chatbot Not Appearing

1. Check browser console for errors
2. Verify all script files are loaded
3. Ensure `chatbot.js` has `defer` attribute
4. Check `data/chatbot-qa.json` is accessible

### AI Responses Not Working

1. Verify API key is configured in `chatbot-config.js`
2. Check browser console for API errors
3. Ensure API key has sufficient credits
4. Test API key with curl/Postman
5. Check CORS settings if using proxy

### Styling Issues

1. Verify `css/chatbot.css` is loaded
2. Check for CSS conflicts with existing styles
3. Ensure theme variables are defined
4. Test in incognito mode

## Support

For issues or questions:
1. Check the [main README](../README.md)
2. Review [COMPLETE_DOCUMENTATION.md](../COMPLETE_DOCUMENTATION.md)
3. Open an issue on GitHub
4. Contact the development team

## License

Part of the VotEth project. See [LICENSE](../LICENSE) for details.

---

**Built with ❤️ for transparent, accessible blockchain voting**
