from flask import Flask, render_template, request, jsonify
from gtts import gTTS
import time

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    text = request.json.get("text", "").strip()

    if not text:
        return jsonify({"error": "Text is empty!"}), 400

    filename = f"static/tts_{int(time.time())}.mp3"

    tts = gTTS(text=text, lang="en")
    tts.save(filename)

    return jsonify({"audio_url": "/" + filename})

if __name__ == "__main__":
    app.run(debug=True)
