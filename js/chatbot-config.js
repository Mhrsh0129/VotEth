/**
 * Chatbot AI Configuration (Optional)
 * 
 * By default, the chatbot uses rule-based responses from the knowledge base.
 * To enable AI-powered responses for complex questions, configure your API key below.
 * 
 * SECURITY NOTE: Never commit API keys to version control!
 * For production, use environment variables or secure backend proxy.
 */

// OPTION 1: OpenAI (GPT-3.5 Turbo)
// Get API key from: https://platform.openai.com/api-keys
// window.CHATBOT_AI_PROVIDER = 'openai';
// window.CHATBOT_AI_KEY = 'sk-your-openai-api-key-here';

// OPTION 2: Google Gemini
// Get API key from: https://makersuite.google.com/app/apikey
// window.CHATBOT_AI_PROVIDER = 'gemini';
// window.CHATBOT_AI_KEY = 'your-gemini-api-key-here';

// OPTION 3: Rule-Based Only (Default - No API Key Needed)
// Leave both commented out to use only rule-based responses
// This is recommended for public deployments to avoid API key exposure

/**
 * How it works:
 * 
 * 1. Rule-Based (Default):
 *    - Matches user questions against knowledge base using keywords
 *    - Fast, reliable, and free
 *    - Covers all common voting-related questions
 * 
 * 2. Hybrid Mode (AI Enabled):
 *    - First tries rule-based matching
 *    - Falls back to AI for complex/unusual questions
 *    - Requires API key configuration
 *    - More flexible but requires API costs
 * 
 * Example Setup for Testing:
 * 
 * 1. Get a free OpenAI API key (requires credit card)
 * 2. Uncomment lines 12-13 above
 * 3. Replace with your actual API key
 * 4. Include this file BEFORE chatbot.js in your HTML
 */

// For production deployments, consider:
// - Using a backend proxy to hide API keys
// - Implementing rate limiting
// - Monitoring API usage and costs
// - Adding user authentication
