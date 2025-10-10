#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 CourseConnect AI - Supabase Setup Wizard\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const templatePath = path.join(__dirname, 'env-template.txt');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('📝 Supabase environment variables detected');
  } else {
    console.log('⚠️  Supabase environment variables missing from .env.local');
    console.log('📖 Please add them manually or copy from env-template.txt');
  }
} else {
  console.log('📄 Creating .env.local from template...');
  try {
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(envPath, templateContent);
    console.log('✅ .env.local created successfully');
    console.log('📝 Please edit .env.local and add your actual Supabase credentials');
  } catch (error) {
    console.log('❌ Failed to create .env.local:', error.message);
    console.log('📝 Please manually copy env-template.txt to .env.local');
  }
}

// Check if Supabase setup script exists
const setupScriptPath = path.join(__dirname, 'supabase-setup.sql');
if (fs.existsSync(setupScriptPath)) {
  console.log('🗄️  Database setup script available at: supabase-setup.sql');
  console.log('📋 Run this script in your Supabase SQL editor');
} else {
  console.log('❌ Database setup script missing');
}

console.log('\n📖 Next Steps:');
console.log('1. Edit .env.local with your Supabase credentials');
console.log('2. Run supabase-setup.sql in your Supabase project');
console.log('3. Restart your development server: npm run dev');
console.log('4. Visit http://localhost:9002/dashboard/chat to test');

console.log('\n🔗 Supabase Dashboard: https://supabase.com/dashboard');
console.log('📚 Documentation: SUPABASE_SETUP.md\n');
