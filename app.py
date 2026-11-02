
from flask import Flask, render_template, request, jsonify
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")


@app.route("/")
def home():
    return render_template("index.html")


# ENGLISH TO PURE KANNADA TRANSLATION
@app.route("/translate", methods=["POST"])
def translate():

    data = request.get_json(silent=True) or {}
    sentence = data.get("text", "").strip()

    if not sentence:
        return jsonify({"translation": "Please enter a sentence."}), 400

    if len(sentence) > 1000:
        return jsonify({
            "translation": "Please enter fewer than 1000 characters."
        }), 400

    if not SARVAM_API_KEY:
        return jsonify({"translation": "API key is missing."}), 500

    try:
        response = requests.post(
            "https://api.sarvam.ai/translate",
            headers={
                "api-subscription-key": SARVAM_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "input": sentence,
                "source_language_code": "en-IN",
                "target_language_code": "kn-IN",
                "model": "mayura:v1",
                "mode": "formal"
            },
            timeout=30
        )

        response.raise_for_status()

        result = response.json()

        return jsonify({
            "translation": result["translated_text"]
        })

    except requests.exceptions.RequestException:
        return jsonify({
            "translation": "Translation service error."
        }), 502


# KANNADA TEXT TO SPEECH
@app.route("/speak", methods=["POST"])
def speak():

    data = request.get_json(silent=True) or {}
    kannada_text = data.get("text", "").strip()

    if not kannada_text:
        return jsonify({"error": "No text provided."}), 400

    if not SARVAM_API_KEY:
        return jsonify({"error": "API key is missing."}), 500

    try:
        response = requests.post(
            "https://api.sarvam.ai/text-to-speech",
            headers={
                "api-subscription-key": SARVAM_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "text": kannada_text,
                "language_code": "kn-IN",
                "model": "bulbul:v3",
                "speaker": "neha",
                "pace": 1.0,
                "output_audio_codec": "wav"
            },
            timeout=60
        )

        response.raise_for_status()

        result = response.json()

        return jsonify({
            "audio": result["audios"][0]
        })

    except requests.exceptions.RequestException:
        return jsonify({
            "error": "Unable to generate Kannada audio."
        }), 502


if __name__ == "__main__":
    app.run(debug=True)
