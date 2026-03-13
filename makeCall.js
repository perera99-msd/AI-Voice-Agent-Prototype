const twilio = require('twilio');

const testAccountSid = process.env.TWILIO_ACCOUNT_SID;
const testAuthToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(testAccountSid, testAuthToken);

client.calls
  .create({
     // The URL is required by the code syntax, though the test environment ignores it
     url: 'https://alaine-unnecessitated-regardlessly.ngrok-free.dev/incoming-call',
     to: '+94766055480',      // Your destination number
     from: '+15005550006'     // REQUIRED: Twilio's Magic Test Number
   })
  .then(call => {
      console.log(`\n✅ TEST API REQUEST SUCCESSFUL!`);
      console.log(`Twilio accepted the request. Simulated Call SID: ${call.sid}`);
      console.log(`(Reminder: Because this uses Test Credentials, your physical phone will NOT ring, and OpenAI will not connect.)\n`);
  })
  .catch(err => {
      console.log(`\n❌ TEST FAILED!`);
      console.error(err);
  });