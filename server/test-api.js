require('dotenv').config();
const http = require('http');

async function testAPI() {
  try {
    console.log('Testing AI Chat API...\n');
    
    const data = JSON.stringify({
      userMessage: 'Hello, how can I donate food?'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed = JSON.parse(responseData);
          console.log('✅ SUCCESS! API is working!');
          console.log('Response:', parsed.reply);
          console.log('\n✅ Chat Assistant is now fixed and working!');
        } else {
          console.error('❌ ERROR:', responseData);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Connection Error:', error.message);
    });
    
    req.write(data);
    req.end();
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testAPI();
