#!/usr/bin/env node

/**
 * Stripe Price Creation Script
 * Creates a price for the Scholar plan automatically
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createScholarPrice() {
  console.log('🏗️  Creating Scholar Plan Price...\n');

  try {
    // First, create a product for the Scholar plan
    const product = await stripe.products.create({
      name: 'Scholar Plan',
      description: 'Advanced features for serious students',
      metadata: {
        plan: 'scholar',
        features: 'unlimited_ai,voice_input,image_analysis,grade_prediction'
      }
    });

    console.log(`✅ Created product: ${product.name} (${product.id})`);

    // Create a recurring price for $4.99/month
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 499, // $4.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'scholar',
        interval: 'monthly'
      }
    });

    console.log(`✅ Created price: $4.99/month (${price.id})`);

    // Update the .env.local file
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the placeholder price ID
    envContent = envContent.replace(
      '# NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID=price_your_scholar_price_id_here',
      `NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID=${price.id}`
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log(`✅ Updated .env.local with price ID: ${price.id}`);
    
    console.log('\n🎉 Scholar Plan setup complete!');
    console.log('   Product ID:', product.id);
    console.log('   Price ID:', price.id);
    console.log('   Price: $4.99/month');
    console.log('\n   You can now test payments in your application.');
    
  } catch (error) {
    console.error('❌ Error creating price:', error.message);
    process.exit(1);
  }
}

createScholarPrice().catch(console.error);


