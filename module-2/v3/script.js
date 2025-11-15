// Main chatbot functionality
class Chatbot {
    constructor() {
        this.userInput = document.getElementById('userInput');
        this.chatbox = document.getElementById('chatbox');
        this.sendBtn = document.getElementById('sendBtn');
        this.status = document.getElementById('status');
        this.currentModelIndex = 0;
        this.currentProxyIndex = 0;
        
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
        this.status.textContent = 'Connecting to AI...';

        const typingMsg = this.addMessage('typing', 'Bot is thinking...');

        try {
            // Try real API calls first
            const response = await this.tryAllAPIMethods(message);
            
            typingMsg.remove();
            
            if (response.success) {
                this.addMessage('bot', response.reply);
                this.status.textContent = 'AI response generated';
                console.log('API Success:', response.reply);
            } else {
                this.addMessage('error', response.error);
                const fallback = this.getFallbackResponse(message);
                this.addMessage('bot', fallback.reply);
                this.status.textContent = 'Using smart response';
            }

        } catch (error) {
            typingMsg.remove();
            console.error('Chat error:', error);
            const fallback = this.getFallbackResponse(message);
            this.addMessage('bot', fallback.reply);
            this.status.textContent = 'Using fallback response';
        } finally {
            this.setUIState(true);
            this.userInput.focus();
        }
    }

    async tryAllAPIMethods(message) {
        // Method 1: Try direct API call
        console.log('Trying direct API call...');
        let result = await this.callHuggingFaceDirect(message);
        if (result.success) return result;

        // Method 2: Try with CORS proxies
        console.log('Trying CORS proxies...');
        result = await this.callWithCorsProxies(message);
        if (result.success) return result;

        // Method 3: Try different model
        console.log('Trying different model...');
        result = await this.tryDifferentModel(message);
        if (result.success) return result;

        return { success: false, error: 'All API methods failed' };
    }

    async callHuggingFaceDirect(message) {
        try {
            const API_URL = CONFIG.MODELS[this.currentModelIndex];
            
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${CONFIG.HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: message,
                    parameters: CONFIG.API_PARAMS
                })
            });

            console.log('Direct API Response:', response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log('API Data:', data);
                
                let reply = data.generated_text || 
                           data[0]?.generated_text || 
                           data.conversation?.generated_responses?.[0] ||
                           "I understand your message!";
                
                return { success: true, reply: reply.trim() };
                
            } else if (response.status === 503) {
                const errorData = await response.json();
                const waitTime = errorData.estimated_time ? Math.ceil(errorData.estimated_time) : 20;
                return { 
                    success: false, 
                    error: `Model loading (${waitTime}s)` 
                };
            } else {
                return { 
                    success: false, 
                    error: `API: ${response.status}` 
                };
            }

        } catch (error) {
            console.log('Direct call failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    async callWithCorsProxies(message) {
        for (let i = 0; i < CONFIG.CORS_PROXIES.length; i++) {
            try {
                const proxy = CONFIG.CORS_PROXIES[i];
                const API_URL = CONFIG.MODELS[this.currentModelIndex];
                const proxyUrl = proxy + encodeURIComponent(API_URL);
                
                console.log(`Trying proxy ${i}:`, proxy);

                const response = await fetch(proxyUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${CONFIG.HF_TOKEN}`,
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: JSON.stringify({
                        inputs: message,
                        parameters: { max_length: 100 }
                    }),
                    timeout: 10000
                });

                if (response.ok) {
                    const data = await response.json();
                    let reply = data.generated_text || "Thanks for your message!";
                    this.currentProxyIndex = i; // Remember working proxy
                    return { success: true, reply: reply.trim() };
                }
            } catch (error) {
                console.log(`Proxy ${i} failed:`, error.message);
                continue;
            }
        }
        return { success: false, error: 'All proxies failed' };
    }

    async tryDifferentModel(message) {
        // Try next model in the list
        this.currentModelIndex = (this.currentModelIndex + 1) % CONFIG.MODELS.length;
        console.log('Switching to model:', this.currentModelIndex);
        
        return await this.callWithCorsProxies(message);
    }

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Exact matches first
        for (const [key, response] of Object.entries(CONFIG.FALLBACK_RESPONSES)) {
            if (lowerMessage === key || lowerMessage.includes(key)) {
                return { success: true, reply: response };
            }
        }

        // Smart contextual responses
        if (lowerMessage.includes('not good') || lowerMessage.includes('bad ai') || lowerMessage.includes('not an good')) {
            return { success: true, reply: "I'm still learning! Could you tell me how I can improve?" };
        }
        
        if (lowerMessage.includes('know nothing')) {
            return { success: true, reply: "I'm constantly learning from our conversations! What would you like to teach me?" };
        }
        
        if (lowerMessage.includes('awesome') || lowerMessage.includes('great') || lowerMessage.includes('good')) {
            return { success: true, reply: "Thank you! I'm glad you're enjoying our conversation! 😊" };
        }

        // Default smart responses based on message content
        const questionWords = ['what', 'how', 'when', 'where', 'why', 'who', 'which'];
        const hasQuestion = questionWords.some(word => lowerMessage.includes(word));
        
        if (hasQuestion) {
            return { 
                success: true, 
                reply: "That's an interesting question! In a full AI implementation, I'd provide a detailed answer based on your query." 
            };
        }

        // Emotional detection
        if (lowerMessage.includes('sad') || lowerMessage.includes('angry') || lowerMessage.includes('upset')) {
            return { 
                success: true, 
                reply: "I sense you might be feeling strong emotions. I'm here to listen and help however I can." 
            };
        }

        // Random engaging response
        const engagingResponses = [
            `I understand you said "${message}". That's really interesting! Tell me more.`,
            `Thanks for sharing that! I'm learning from our conversation.`,
            `"${message}" - that gives me something to think about!`,
            `I appreciate you saying "${message}". It helps me understand you better.`,
            `That's a fascinating point about "${message}". What else is on your mind?`
        ];
        
        const randomResponse = engagingResponses[Math.floor(Math.random() * engagingResponses.length)];
        return { success: true, reply: randomResponse };
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