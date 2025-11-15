// Configuration file
const CONFIG = {
    HF_TOKEN: "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",
    MODELS: [
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-small",
        "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
    ],
    CORS_PROXIES: [
        "https://cors-anywhere.herokuapp.com/",
        "https://api.allorigins.win/raw?url=",
        "https://cors.bridged.cc/"
    ],
    API_PARAMS: {
        max_length: 150,
        temperature: 0.9,
        do_sample: true,
        return_full_text: false
    },
    FALLBACK_RESPONSES: {
        'hello': 'Hello! Nice to meet you! How can I assist you today?',
        'hi': 'Hi there! 😊 What would you like to talk about?',
        'how are you': "I'm doing great! Thanks for asking. How about you?",
        'what is your name': "I'm an AI chatbot powered by Hugging Face models!",
        'thank you': "You're welcome! Is there anything else I can help with?",
        'bye': 'Goodbye! Feel free to come back if you have more questions!',
        'who created you': 'I was created using Hugging Face API and JavaScript!',
        'what can you do': 'I can chat with you, answer questions, and have conversations using AI!',
        'awesome': "Thank you! I'm glad you think so! 😊",
        'good': "That's great to hear! How can I help you today?",
        'bad': "I'm sorry to hear that. How can I improve?",
        'nothing': "I'm here to help! What would you like to talk about?",
        'you know': "I'm constantly learning! What would you like me to know?"
    }
};