// Configuration file - Using Google Gemini API
const CONFIG = {
    // Your Google Gemini API Key
    GEMINI_API_KEY: "AIzaSyAiZm3dJ-aV_vyT-pfmORb_IsQS-magJ5Y",
    
    // Correct Gemini API endpoints
    GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
    
    // Fallback responses for when API fails
    FALLBACK_RESPONSES: {
        'hello': 'Hello! Nice to meet you! How can I assist you today?',
        'hi': 'Hi there! 😊 What would you like to talk about?',
        'how are you': "I'm doing great! Thanks for asking. How about you?",
        'what is your name': "I'm an AI chatbot powered by Google Gemini!",
        'thank you': "You're welcome! Is there anything else I can help with?",
        'bye': 'Goodbye! Feel free to come back if you have more questions!',
        'who created you': 'I was created using Google Gemini API!',
        'what can you do': 'I can chat with you, answer questions, and help with various topics using AI!'
    }
};