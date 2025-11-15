// Main chatbot functionality with Google Gemini API
class Chatbot {
    constructor() {
        this.userInput = document.getElementById('userInput');
        this.chatbox = document.getElementById('chatbox');
        this.sendBtn = document.getElementById('sendBtn');
        this.status = document.getElementById('status');
        this.conversationHistory = [];
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.sendBtn.disabled) {
                this.sendMessage();
            }
        });
        
        this.userInput.focus();
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.userInput.value = '';
        
        this.setUIState(false);
        this.status.textContent = 'Connecting to Gemini AI...';

        const typingMsg = this.addMessage('typing', 'Bot is thinking...');

        try {
            // Try Google Gemini API first
            console.log('Sending message to Gemini:', message);
            const response = await this.callGeminiAPI(message);
            
            typingMsg.remove();
            
            if (response.success) {
                this.addMessage('bot', response.reply);
                this.status.textContent = 'AI response generated';
                console.log('Gemini response successful:', response.reply);
            } else {
                // Show why API failed
                this.addMessage('error', `API Error: ${response.error}`);
                this.status.textContent = 'API failed - using smart response';
                const fallback = this.getFallbackResponse(message);
                this.addMessage('bot', fallback.reply);
                console.log('Gemini API failed:', response.error);
            }

        } catch (error) {
            typingMsg.remove();
            console.error('Chat error:', error);
            this.addMessage('error', `Connection Error: ${error.message}`);
            this.status.textContent = 'Connection error - using smart response';
            const fallback = this.getFallbackResponse(message);
            this.addMessage('bot', fallback.reply);
        } finally {
            this.setUIState(true);
            this.userInput.focus();
        }
    }

    async callGeminiAPI(message) {
    try {
        // Using correct API endpoint
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
        
        console.log('Making API call to Gemini...');

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `You are a helpful and friendly AI assistant. Respond to this message conversationally: ${message}`
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status, response.statusText);

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                console.error('API Error details:', errorData);
                errorMessage = errorData.error?.message || JSON.stringify(errorData);
            } catch (e) {
                errorMessage = await response.text();
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('API response:', data);

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            console.log('Generated reply:', reply);
            return { success: true, reply: reply };
        } else {
            console.error('Unexpected response format:', data);
            throw new Error('No response content in API response');
        }

    } catch (error) {
        console.error('Gemini API call failed:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase().trim();
        
        console.log('Using fallback for message:', message);
        
        // Direct matches
        const directResponses = {
            'hello': 'Hello! Nice to meet you! How can I assist you today?',
            'hi': 'Hi there! 😊 What would you like to talk about?',
            'hey': 'Hey! Great to see you. What\'s on your mind?',
            'how are you': "I'm doing great! Thanks for asking. How about you?",
            'what is your name': "I'm an AI chatbot powered by Google Gemini!",
            'who are you': "I'm an AI assistant created using Google's Gemini API to help with conversations and questions!",
            'thank you': "You're welcome! Is there anything else I can help with?",
            'thanks': "You're welcome! Happy to help!",
            'bye': 'Goodbye! Feel free to come back if you have more questions!',
            'goodbye': 'Goodbye! Have a wonderful day!',
            'see you': 'See you later! It was nice chatting with you!',
            'who created you': 'I was created using Google Gemini API!',
            'what can you do': 'I can chat with you, answer questions, and have interesting conversations using AI!'
        };

        // Check for direct matches first
        for (const [key, response] of Object.entries(directResponses)) {
            if (lowerMessage === key.toLowerCase()) {
                return { success: true, reply: response };
            }
        }

        // Check for partial matches
        for (const [key, response] of Object.entries(directResponses)) {
            if (lowerMessage.includes(key)) {
                return { success: true, reply: response };
            }
        }

        // Specific case for "who are you"
        if (lowerMessage.includes('who are you')) {
            return { success: true, reply: "I'm an AI assistant powered by Google Gemini! I'm here to chat and help with your questions." };
        }

        // Contextual responses
        if (/(hello|hi|hey)[\s\w]*there/.test(lowerMessage)) {
            return { success: true, reply: "Hello there! 👋 How can I help you today?" };
        }
        
        if (lowerMessage.includes('not good') || lowerMessage.includes('bad ai') || lowerMessage.includes('stupid') || lowerMessage.includes('dumb')) {
            return { success: true, reply: "I'm sorry I'm not meeting your expectations. I'm here to help - what would you prefer to talk about?" };
        }
        
        if (lowerMessage.includes('know nothing') || lowerMessage.includes('dont know')) {
            return { success: true, reply: "I'm here to learn from our conversation! Every chat helps me improve. What would you like to discuss?" };
        }
        
        if (lowerMessage.includes('awesome') || lowerMessage.includes('great') || lowerMessage.includes('good') || lowerMessage.includes('excellent')) {
            return { success: true, reply: "Thank you! I'm really enjoying our conversation too! 😊" };
        }

        if (lowerMessage.includes('boring') || lowerMessage.includes('not interesting')) {
            return { success: true, reply: "Let's spice things up! Tell me about something you're passionate about or ask me anything!" };
        }

        // Question detection
        if (lowerMessage.includes('?')) {
            const questionType = this.detectQuestionType(lowerMessage);
            const responses = {
                'what': "That's a 'what' question! I'd normally research and give you a comprehensive answer about that.",
                'how': "That's a 'how' question! I'd provide step-by-step guidance for that.",
                'why': "That's a 'why' question! I'd analyze the reasons and causes to give you a thorough explanation.",
                'when': "That's a 'when' question! I'd check timelines to give you accurate timing information.",
                'where': "That's a 'where' question! I'd use location data to provide you with precise information.",
                'who': "That's a 'who' question! I'd search through information to find the right person or entity."
            };
            
            const reply = responses[questionType] || "That's an interesting question! I'd love to help you with that.";
            return { success: true, reply: reply };
        }

        // Default smart responses
        const smartResponses = [
            `I understand you said "${message}". That's really interesting! Tell me more about that.`,
            `Thanks for sharing: "${message}". I find that quite fascinating!`,
            `"${message}" - that's a thoughtful point! What inspired that idea?`,
            `I appreciate you saying "${message}". It gives me insight into your perspective.`,
            `That's an interesting way to put it: "${message}". Could you elaborate?`,
            `"${message}" - that's quite insightful! How did you come to that conclusion?`
        ];
        
        const randomResponse = smartResponses[Math.floor(Math.random() * smartResponses.length)];
        return { success: true, reply: randomResponse };
    }

    detectQuestionType(message) {
        if (message.includes(' what ')) return 'what';
        if (message.includes(' how ')) return 'how';
        if (message.includes(' why ')) return 'why';
        if (message.includes(' when ')) return 'when';
        if (message.includes(' where ')) return 'where';
        if (message.includes(' who ')) return 'who';
        return 'general';
    }

    addMessage(type, text) {
        const messageDiv = document.createElement('div');
        
        switch(type) {
            case 'user':
                messageDiv.className = 'user-msg';
                messageDiv.innerHTML = `<strong>You:</strong> ${text}`;
                break;
            case 'bot':
                messageDiv.className = 'bot-msg';
                messageDiv.innerHTML = `<strong>Bot:</strong> ${text}`;
                break;
            case 'typing':
                messageDiv.className = 'typing';
                messageDiv.innerHTML = `<strong>Bot:</strong> ${text}`;
                break;
            case 'error':
                messageDiv.className = 'error-msg';
                messageDiv.innerHTML = `<strong>Note:</strong> ${text}`;
                break;
        }
        
        this.chatbox.appendChild(messageDiv);
        this.chatbox.scrollTop = this.chatbox.scrollHeight;
        
        return messageDiv;
    }

    setUIState(enabled) {
        this.userInput.disabled = !enabled;
        this.sendBtn.disabled = !enabled;
        this.sendBtn.textContent = enabled ? 'Send' : 'Processing...';
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.chatbot = new Chatbot();
});

// Global function for HTML onclick
function sendMessage() {
    if (window.chatbot) {
        window.chatbot.sendMessage();
    }
}