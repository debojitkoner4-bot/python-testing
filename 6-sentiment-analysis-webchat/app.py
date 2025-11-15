from flask import Flask, render_template, request, jsonify
from transformers import pipeline
import time

app = Flask(__name__)

# Load sentiment analysis model
print("Loading sentiment analysis model...")
sentiment = pipeline("sentiment-analysis")
print("Model loaded successfully!")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    user_message = request.json.get('message')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    try:
        # Analyze sentiment using local model
        result = sentiment(user_message)[0]
        
        # Generate simple response based on sentiment
        label = result['label']
        score = round(result['score'], 3)
        
        if label == 'POSITIVE':
            reply = f"😊 That sounds positive! (Confidence: {score})"
        else:
            reply = f"😔 That sounds negative. (Confidence: {score})"
        
        return jsonify({
            'reply': reply,
            'sentiment': label,
            'confidence': score
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)