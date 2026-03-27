# 🎙️ AI Voice Agent Prototype

> A Node.js prototype for building an AI-powered, phone-call capable voice agent.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

---

## ✨ Overview
This repository is an early-stage prototype of an **AI Voice Agent** that can place and handle phone calls. It is intended as a starting point for experimentation (Twilio + AI model + real-time voice).

## ✅ Key Features
- 📞 **Outbound calling** (prototype)
- 🗣️ **Voice interactions** (speech-to-text / text-to-speech)
- 🧠 **LLM-powered responses** (bring your own provider)
- 🧩 **Environment-based configuration** via `.env`

## 🧱 Tech Stack
- 🟢 **Node.js**
- 📦 **npm**
- ☁️ **Twilio** (telephony)
- 🤖 **LLM Provider** (OpenAI / Anthropic / etc.)

---

## 🚀 Getting Started

### 1) Prerequisites
- Node.js **18+**
- A Twilio account (or another telephony provider)

### 2) Install
```bash
npm install
```

### 3) Configure environment
Create a `.env` file using the example:
```bash
cp .env.example .env
```

#### Environment variables
These are the key variables used by this prototype:

- `OPENAI_API_KEY` — OpenAI API key used for the Realtime WebSocket connection.
- `TWILIO_ACCOUNT_SID` — Your Twilio Account SID.
- `TWILIO_AUTH_TOKEN` — Your Twilio Auth Token.
- `TWILIO_PHONE_NUMBER` — A Twilio phone number in E.164 format (example: `+15005550006` for Twilio test).
- `MY_PHONE_NUMBER` — Your destination phone number (E.164 format).
- `PORT` — (Optional) Port for the local server (defaults to `3000`).

> Note: Never commit your real `.env` file. Use `.env.example` as the template.

### 4) Run the server
```bash
node index.js
```

By default the server starts on:
- `http://localhost:3000`

### 5) Expose your local server (recommended for Twilio webhooks)
If you’re running locally, Twilio needs a public URL to reach your webhook endpoints.
A common approach is to use **ngrok** (or a similar tunneling tool), then configure Twilio to call:

- `POST https://<your-public-host>/incoming-call`

---

## 📞 Twilio Webhook / Call Flow (high-level)

- Twilio hits `POST /incoming-call`
- The server responds with TwiML that tells Twilio to start a `<Stream>` to:
  - `wss://<your-host>/media-stream`
- Twilio streams audio to your server via WebSocket
- Your server forwards audio to the OpenAI Realtime API
- The OpenAI Realtime API returns audio deltas that are forwarded back to Twilio

---

## ☎️ Outbound call script (prototype)

There is a small script that demonstrates initiating a call request:

```bash
node makeCall.js
```

**Important:**
- `makeCall.js` currently contains **hard-coded** example values (like the webhook URL and phone numbers).
- If you plan to use it beyond a quick test, update it to read `to`, `from`, and `url` from environment variables.

---

## 📂 Project Structure
- `index.js` — main entry point (Express + WebSockets)
- `makeCall.js` — call initiation logic (prototype)
- `.env.example` — environment template

## 🛡️ Security (no emojis by request)
For security policies, see [SECURITY.md](SECURITY.md).

## 🤝 Contributing
For contributing guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📜 Code of Conduct
For code of conduct details, see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## 🗺️ Roadmap
- [ ] Inbound call handling
- [ ] Streaming STT/TTS for lower latency
- [ ] Conversation memory + tool calling
- [ ] Deployable server (Docker)

## 📄 License (no emojis by request)
Licensed under the MIT License — see [LICENSE](LICENSE).

---

### 🙌 Acknowledgements
Built as a learning/prototyping project.
