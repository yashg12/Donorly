// Quick test script to verify login works
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login endpoint...\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user@test.com',
      password: 'test123'
    });
    
    console.log('✅ Login successful!');
    console.log('📦 Response:', JSON.stringify(response.data, null, 2));
    console.log('\n✨ You can now login with:');
    console.log('   Email: user@test.com');
    console.log('   Password: test123');
    
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Error:', error.response?.data || error.message);
  }
}

testLogin();
