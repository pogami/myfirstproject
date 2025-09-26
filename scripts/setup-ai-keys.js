#!/usr/bin/env node

/**
 * AI Keys Setup Script
 * Helps you quickly configure AI API keys for CourseConnect
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAIKeys() {
  console.log('🤖 CourseConnect AI Setup\n');
  console.log('This script will help you configure AI API keys to get intelligent responses instead of generic ones.\n');

  const envPath = path.resolve(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  console.log('📋 Available AI Providers:\n');
  console.log('1. Google AI (Gemini) - FREE tier available');
  console.log('2. OpenAI (ChatGPT) - Pay per use');
  console.log('3. Both (recommended for reliability)\n');

  const choice = await question('Which provider would you like to set up? (1/2/3): ');
  
  let googleKey = '';
  let openaiKey = '';
  let providerPreference = 'google';

  if (choice === '1' || choice === '3') {
    console.log('\n🔑 Google AI Setup:');
    console.log('1. Go to: https://aistudio.google.com/app/apikey');
    console.log('2. Sign in with your Google account');
    console.log('3. Click "Create API Key"');
    console.log('4. Copy the generated key\n');
    
    googleKey = await question('Enter your Google AI API key: ');
    
    if (googleKey.trim()) {
      console.log('✅ Google AI key added');
    }
  }

  if (choice === '2' || choice === '3') {
    console.log('\n🔑 OpenAI Setup:');
    console.log('1. Go to: https://platform.openai.com/api-keys');
    console.log('2. Sign in to your OpenAI account');
    console.log('3. Click "Create new secret key"');
    console.log('4. Copy the generated key');
    console.log('5. Add billing information if needed\n');
    
    openaiKey = await question('Enter your OpenAI API key: ');
    
    if (openaiKey.trim()) {
      console.log('✅ OpenAI key added');
      if (!googleKey.trim()) {
        providerPreference = 'openai';
      }
    }
  }

  // Update .env.local file
  const newLines = [];
  
  if (googleKey.trim()) {
    newLines.push(`GOOGLE_AI_API_KEY=${googleKey.trim()}`);
  }
  
  if (openaiKey.trim()) {
    newLines.push(`OPENAI_API_KEY=${openaiKey.trim()}`);
  }
  
  newLines.push(`AI_PROVIDER_PREFERENCE=${providerPreference}`);

  // Remove existing AI keys from env content
  envContent = envContent.replace(/^GOOGLE_AI_API_KEY=.*$/gm, '');
  envContent = envContent.replace(/^OPENAI_API_KEY=.*$/gm, '');
  envContent = envContent.replace(/^AI_PROVIDER_PREFERENCE=.*$/gm, '');

  // Add new keys
  if (newLines.length > 0) {
    envContent += '\n# AI Configuration\n';
    newLines.forEach(line => {
      envContent += line + '\n';
    });
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');

  console.log('\n🎉 AI Configuration Complete!');
  console.log('\n📝 What was added to .env.local:');
  newLines.forEach(line => {
    console.log(`   ${line}`);
  });

  console.log('\n🚀 Next Steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Go to /dashboard/chat');
  console.log('3. Ask a question - you should get intelligent responses!');

  if (choice === '1' && !googleKey.trim()) {
    console.log('\n⚠️  No Google AI key was added. You can run this script again to add it later.');
  }

  if (choice === '2' && !openaiKey.trim()) {
    console.log('\n⚠️  No OpenAI key was added. You can run this script again to add it later.');
  }

  if (choice === '3' && (!googleKey.trim() && !openaiKey.trim())) {
    console.log('\n⚠️  No AI keys were added. You can run this script again to add them later.');
  }

  console.log('\n💡 Tips:');
  console.log('- Google AI has a free tier with generous limits');
  console.log('- OpenAI charges per token but is very reliable');
  console.log('- Having both provides automatic fallback if one fails');
  console.log('- Check AI_SETUP_GUIDE.md for more detailed instructions');

  rl.close();
}

setupAIKeys().catch(console.error);


