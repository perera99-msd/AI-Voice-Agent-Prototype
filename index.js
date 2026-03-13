require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
// Add this middleware so Express can read Twilio's POST data
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 1. The Twilio Webhook (When the call connects)
app.post('/incoming-call', (req, res) => {
    console.log('\n=============================================');
    console.log('🚨 📞 INCOMING CALL RECEIVED FROM TWILIO! 🚨');
    console.log(`Caller ID: ${req.body.From || 'Unknown'}`);
    console.log('=============================================\n');

    const host = req.headers.host;
    const twiml = `
    <Response>
        <Say>Connecting to the AI Agent.</Say>
        <Connect>
            <Stream url="wss://${host}/media-stream" />
        </Connect>
    </Response>
    `;
    res.type('text/xml');
    res.send(twiml);
});

// 2. Handle the WebSocket connection from Twilio
wss.on('connection', (ws) => {
    console.log('✅ Twilio WebSocket connected to our server.');
    let streamSid = null;

    // Connect to OpenAI Realtime API
    const openAiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1'
        }
    });

    openAiWs.on('open', () => {
        console.log('✅ Connected to OpenAI Realtime API.');
        
        const sessionUpdate = {
            type: 'session.update',
            session: {
                instructions: 'You are an automated support agent for the VoltHive EV charging station management platform. Help drivers troubleshoot charging station issues. Keep your answers brief, friendly, and highly technical. You are speaking over a phone call.',
                voice: 'alloy',
                input_audio_format: 'g711_ulaw',
                output_audio_format: 'g711_ulaw',
                turn_detection: {
                    type: 'server_vad',
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 200
                }
            }
        };
        openAiWs.send(JSON.stringify(sessionUpdate));

        setTimeout(() => {
            const createResponse = {
                type: 'response.create',
                response: {
                    modalities: ['audio', 'text'],
                    instructions: 'Greet the user briefly. Say "Hi, this is VoltHive Support. How can I help you with your charging station today?"'
                }
            };
            openAiWs.send(JSON.stringify(createResponse));
        }, 1000); 
    });

    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        if (msg.event === 'start') {
            streamSid = msg.start.streamSid;
            console.log(`🎙️ Audio Stream started: ${streamSid}`);
        } else if (msg.event === 'media' && openAiWs.readyState === WebSocket.OPEN) {
            openAiWs.send(JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: msg.media.payload
            }));
        }
    });

    openAiWs.on('message', (data) => {
        const response = JSON.parse(data);
        if (response.type === 'response.audio.delta' && response.delta) {
            ws.send(JSON.stringify({
                event: 'media',
                streamSid: streamSid,
                media: { payload: response.delta }
            }));
        }
        if (response.type === 'response.audio_transcript.done') {
            console.log(`🤖 AI said: ${response.transcript}`);
        }
    });

    ws.on('close', () => {
        console.log('❌ Twilio stream closed.');
        if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
    });

    openAiWs.on('error', (err) => console.error('OpenAI WebSocket Error:', err));
    ws.on('error', (err) => console.error('Twilio WebSocket Error:', err));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});