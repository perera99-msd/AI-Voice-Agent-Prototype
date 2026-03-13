# 🎙️ AI Voice Agent Prototype 🚀

This repository is a Node.js voice agent prototype that bridges a live Twilio phone call to the OpenAI Realtime API over WebSockets.

Instead of running a traditional speech pipeline like Speech-to-Text -> LLM -> Text-to-Speech, this project streams audio directly into a realtime model and streams synthesized audio back to the caller. The result is a lower-latency, more natural phone conversation with interruption handling built into the interaction model.

## ✨ What This Project Does

- Accepts an inbound or test-triggered phone call through Twilio.
- Returns TwiML that starts a live audio stream.
- Forwards incoming audio frames to the OpenAI Realtime API.
- Streams AI-generated audio back to the caller in near real time.
- Starts with a built-in EV charging support persona that you can replace for a hotel assistant or other domain.

## 🧱 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Server:** [Express](https://expressjs.com/)
- **Telephony:** [Twilio Voice](https://www.twilio.com/docs/voice), [TwiML](https://www.twilio.com/docs/voice/twiml), and [Media Streams](https://www.twilio.com/docs/voice/media-streams)
- **Realtime AI:** [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- **Transport:** [ws WebSocket library](https://www.npmjs.com/package/ws)
- **Local tunneling:** [ngrok](https://ngrok.com/docs/getting-started/)

## 🗂️ Project Layout

- `index.js`: Main Express server, Twilio webhook handler, and Twilio <-> OpenAI audio bridge.
- `makeCall.js`: Helper script that creates a Twilio test call request.
- `.env.example`: Example environment variables.
- `Instructions.md`: Architecture notes, use cases, and extension ideas.

## ⚙️ Prerequisites

You need the following before testing the project end to end:

1. **Node.js** installed locally.
2. **An OpenAI API key** with billing enabled for Realtime usage.
3. **A Twilio account**. A paid account is strongly recommended if you want real outbound calls or international routing.
4. **ngrok** or another HTTPS tunnel for exposing your local server to Twilio.

## 🚀 Setup

### 1. Clone the repository

```bash
git clone https://github.com/perera99-msd/AI-Voice-Agent-Prototype.git
cd ev-voice-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Copy `.env.example` to `.env` and fill in your actual credentials:

```env
OPENAI_API_KEY=sk-proj-your-openai-key
TWILIO_ACCOUNT_SID=ACyour-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
MY_PHONE_NUMBER=+1234567891
```

### 4. Start the local server

```bash
node index.js
```

By default the server listens on port `3000`.

### 5. Expose the server publicly

In another terminal:

```bash
ngrok http 3000
```

Copy the generated HTTPS URL, for example `https://your-subdomain.ngrok-free.app`.

### 6. Point Twilio at the webhook

You have two ways to test:

#### Option A: Use your Twilio phone number

Configure the voice webhook for your Twilio number to:

```text
https://your-ngrok-domain/incoming-call
```

Twilio phone number setup docs: [Twilio phone number voice configuration](https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account#make-and-receive-phone-calls)

#### Option B: Use the helper script

Open `makeCall.js` and update the `url` field to your current ngrok URL plus `/incoming-call`, then run:

```bash
node makeCall.js
```

## ☎️ Important Note About `makeCall.js`

The current `makeCall.js` file is configured for **Twilio test credentials behavior**, including a Twilio magic test number. That means:

- Twilio may accept the API request.
- Your physical phone will **not** ring when using test credentials.
- OpenAI audio streaming will **not** behave like a real production call path.

If you want an actual live phone call, switch `makeCall.js` to use your real Twilio credentials and a real Twilio phone number.

Twilio test credentials reference: [Twilio test credentials](https://www.twilio.com/docs/iam/test-credentials)

## 🏨 Customizing the Agent for a Hotel Management System

The current system prompt in `index.js` is written for an EV charging support use case. To adapt it for a hotel assistant, edit the `session.update` payload and replace the `instructions` value.

Suggested hotel prompt:

```text
You are an automated front-desk assistant for a luxury hotel. Help guests with room inquiries, service requests, booking confirmations, and concierge-style questions. Keep your answers brief, hospitable, and professional. You are speaking over a phone call.
```

You should also update the initial greeting inside the `response.create` block so the first spoken line matches the hotel scenario.

## 🔄 Runtime Flow

1. A call reaches Twilio.
2. Twilio sends an HTTP request to `/incoming-call`.
3. The server returns TwiML with `<Connect><Stream /></Connect>`.
4. Twilio opens a WebSocket to `/media-stream`.
5. The server opens a second WebSocket to the OpenAI Realtime API.
6. Twilio audio is forwarded to OpenAI as `input_audio_buffer.append` events.
7. OpenAI sends `response.audio.delta` events back.
8. The server forwards those audio chunks to Twilio so the caller hears the AI.

## 🛠️ Troubleshooting

### OpenAI WebSocket closes immediately

Check the following:

- Your `OPENAI_API_KEY` is valid.
- Billing is enabled on your OpenAI project.
- The model name in `index.js` is still available to your account.

Realtime docs: [OpenAI Realtime API guide](https://platform.openai.com/docs/guides/realtime)

### Twilio hits the webhook, but no audio comes back

Check the following:

- Your ngrok tunnel is active and uses `https`.
- The generated TwiML points to the correct `wss://.../media-stream` URL.
- Your server logs show both the Twilio WebSocket and OpenAI WebSocket connecting.

### The phone does not ring

Common causes:

- You are still using Twilio **test credentials** in `makeCall.js`.
- Your Twilio account is in trial mode and the destination number is not verified.
- Your carrier or route blocks the call, especially for international destinations.

Twilio trial account docs: [Twilio free trial limitations](https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account)

### Twilio returns an error when placing the call

Verify:

- `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct.
- You are using a valid `from` number for live calls.
- The destination number format is valid E.164 format, for example `+14155552671`.

## 📚 Useful References

- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [Twilio Media Streams](https://www.twilio.com/docs/voice/media-streams)
- [Twilio `<Stream>` TwiML noun](https://www.twilio.com/docs/voice/twiml/stream)
- [Twilio Calls API](https://www.twilio.com/docs/voice/api/call-resource)
- [ngrok getting started](https://ngrok.com/docs/getting-started/)

## ⚠️ Current Limitations

- There is no automated test suite yet.
- The business prompt is hardcoded in `index.js`.
- `makeCall.js` is currently closer to a sandbox helper than a production outbound dialer.
- There is minimal error recovery and no retry strategy for dropped websocket sessions.

## 🤝 Repository

Source: [AI-Voice-Agent-Prototype](https://github.com/perera99-msd/AI-Voice-Agent-Prototype)