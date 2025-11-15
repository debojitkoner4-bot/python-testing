from flask import Flask, render_template, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# Load summarization model
print("Loading summarization model...")
summarizer = pipeline("summarization")
print("Model loaded successfully!")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize_text():
    text = request.json.get('text')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    if len(text.split()) < 30:
        return jsonify({'error': 'Text too short. Please provide at least 30 words.'}), 400
    
    try:
        # Calculate appropriate lengths based on input text
        word_count = len(text.split())
        max_length = min(150, max(60, word_count // 3))
        min_length = min(30, max_length // 2)
        
        # Summarize the text
        summary = summarizer(
            text, 
            max_length=max_length, 
            min_length=min_length, 
            do_sample=False
        )[0]['summary_text']
        
        return jsonify({
            'summary': summary,
            'original_length': word_count,
            'summary_length': len(summary.split())
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)