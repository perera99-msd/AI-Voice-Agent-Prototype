# 🎙️ AI Voice Agent Prototype (Twilio + OpenAI Realtime API) 🚀

Welcome to the AI Voice Agent R&D Prototype! This repository contains a fully functional Node.js backend that connects traditional phone calls (via Twilio) directly to the OpenAI Realtime API using WebSockets. 

It achieves ultra-low latency, speech-to-speech conversational AI, completely bypassing the clunky "Speech-to-Text -> LLM -> Text-to-Speech" cascaded pipelines.

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **Telephony:** Twilio (Voice SDK, TwiML, SIP/Webhooks)
* **AI Brain:** OpenAI Realtime API (`gpt-4o-realtime-preview`)
* **Tunneling:** ngrok (for local webhook testing)

## ⚙️ Prerequisites
Before you start, you must have the following:
1. Node.js installed on your machine.
2. A **funded** OpenAI Developer Account (The Realtime API requires at least $5 in prepaid credits; $0.00 free tiers will instantly drop the WebSocket connection).
3. A Twilio Account (Upgraded/Paid account recommended for international routing).
4. ngrok installed for local testing.

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/ev-voice-agent.git](https://github.com/yourusername/ev-voice-agent.git)
   cd ev-voice-agent