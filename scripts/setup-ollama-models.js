#!/usr/bin/env node

/**
 * Ollama Model Setup Script
 * Downloads the best models for CourseConnect AI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CourseConnect AI - Ollama Model Setup');
console.log('==========================================');

const models = [
  {
    name: 'llama3.1:8b',
    description: 'Best general-purpose model for chat and analysis',
    priority: 'high',
    size: '4.9GB'
  },
  {
    name: 'llava:latest', 
    description: 'Vision model for image and document analysis',
    priority: 'high',
    size: '4.7GB'
  },
  {
    name: 'codellama:latest',
    description: 'Specialized coding assistant',
    priority: 'medium', 
    size: '3.8GB'
  },
  {
    name: 'qwen2.5:14b',
    description: 'Advanced reasoning and multilingual support',
    priority: 'medium',
    size: '8GB'
  },
  {
    name: 'nomic-embed-text:latest',
    description: 'Text embeddings for similarity search',
    priority: 'low',
    size: '274MB'
  }
];

async function checkOllamaStatus() {
  try {
    console.log('🔍 Checking Ollama status...');
    const result = execSync('ollama --version', { encoding: 'utf8' });
    console.log('✅ Ollama is installed:', result.trim());
    return true;
  } catch (error) {
    console.error('❌ Ollama not found. Please install Ollama first:');
    console.error('   Visit: https://ollama.ai/');
    return false;
  }
}

async function installModel(modelInfo) {
  const { name, description, priority, size } = modelInfo;
  
  try {
    console.log(`\n📥 Installing ${name} (${size})`);
    console.log(`   ${description}`);
    
    execSync(`ollama pull ${name}`, { 
      stdio: 'inherit',
      timeout: 30 * 60 * 1000 // 30 minute timeout
    });
    
    console.log(`✅ Successfully installed ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to install ${name}:`, error.message);
    return false;
  }
}

async function testModel(modelName) {
  try {
    console.log(`\n🧪 Testing ${modelName}...`);
    
    const testPrompt = "Hello! Can you help me with a simple math question: What is 7 + 5?";
    
    const result = execSync(`echo "${testPrompt}" | ollama run ${modelName}`, { 
      encoding: 'utf8',
      timeout: 30000 // 30 second timeout
    });
    
    if (result.includes('12')) {
      console.log('✅ Model test passed - responds correctly');
      return true;
    } else {
      console.log('⚠️  Model test inconclusive');
      return false;
    }
  } catch (error) {
    console.error(`❌ Model test failed:`, error.message);
    return false;
  }
}

async function main() {
  const isOllamaReady = await checkOllamaStatus();
  
  if (!isOllamaReady) {
    process.exit(1);
  }
  
  console.log('\n📋 Available Models:');
  models.forEach((model, index) => {
    console.log(`${index + 1}. ${model.name} (${model.size}) - ${model.description}`);
  });
  
  console.log('\n🎯 Recommended installation order:');
  console.log('1. llama3.1:8b - Essential for chat functionality');
  console.log('2. llava:latest - Required for image/document analysis'); 
  console.log('3. codellama:latest - Optional for coding help');
  console.log('4. qwen2.5:14b - Optional advanced model');
  
  const args = process.argv.slice(2);
  const installAll = args.includes('--all');
  const priorityModels = models.filter(m => m.priority === 'high' || installAll);
  
  console.log(`\n🚀 Installing ${priorityModels.length} priority models...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const model of priorityModels) {
    const success = await installModel(model);
    if (success) {
      successCount++;
      // Test the first few models
      if (successCount <= 2) {
        await testModel(model.name);
      }
    } else {
      failCount++;
    }
  }
  
  console.log('\n📊 Installation Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  if (successCount > 0) {
    console.log('\n🎉 CourseConnect AI is ready!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server');
    console.log('2. Test the chat functionality');
    console.log('3. Upload documents for analysis');
  } else {
    console.log('\n⚠️  No models were successfully installed.');
    console.log('Please check your network connection and Ollama installation.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { models, installModel, testModel };
