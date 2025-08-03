// Simple test to verify OpenAI API key works
require('dotenv').config();

const OpenAI = require('openai');

async function testOpenAI() {
  console.log('🔍 Testing OpenAI configuration...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    return;
  }
  
  if (process.env.OPENAI_API_KEY === 'sk-your_real_openai_key_here') {
    console.error('❌ Please replace OPENAI_API_KEY with your real key');
    return;
  }
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('🧪 Testing API connection...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello! Just testing the API.' }],
      max_tokens: 10
    });
    
    console.log('✅ OpenAI API works!');
    console.log('📝 Response:', response.choices[0].message.content);
    console.log('💰 Usage:', response.usage);
    
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    
    if (error.status === 401) {
      console.error('🔑 Invalid API key - check your OPENAI_API_KEY');
    } else if (error.status === 429) {
      console.error('💸 Rate limit or no credits - check your OpenAI account');
    }
  }
}

testOpenAI();