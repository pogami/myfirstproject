#!/usr/bin/env node

/**
 * Stripe Configuration Test Script
 * Run this to verify your Stripe setup
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConfig() {
  console.log('🔍 Testing Stripe Configuration...\n');

  // Test 1: Check if Stripe key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY is not set');
    console.log('   Add it to your .env.local file');
    return;
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.log('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
    console.log('   Add it to your .env.local file');
    return;
  }

  console.log('✅ Environment variables are set');

  // Test 2: Check if Stripe key is valid
  try {
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe API key is valid');
    console.log(`   Account: ${account.display_name || account.id}`);
    console.log(`   Mode: ${account.livemode ? 'Live' : 'Test'}`);
  } catch (error) {
    console.log('❌ Stripe API key is invalid');
    console.log(`   Error: ${error.message}`);
    return;
  }

  // Test 3: Check if price ID exists
  const priceId = process.env.NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID;
  if (!priceId) {
    console.log('❌ NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID is not set');
    console.log('   Create a price in Stripe Dashboard and add the ID to .env.local');
    return;
  }

  if (!priceId.startsWith('price_')) {
    console.log('❌ Invalid price ID format');
    console.log('   Price ID should start with "price_"');
    return;
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    console.log('✅ Price ID is valid');
    console.log(`   Price: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
    console.log(`   Interval: ${price.recurring?.interval || 'one-time'}`);
  } catch (error) {
    console.log('❌ Price ID is invalid');
    console.log(`   Error: ${error.message}`);
    console.log('   Create a new price in Stripe Dashboard');
    return;
  }

  console.log('\n🎉 Stripe configuration is working correctly!');
  console.log('   You can now test payments in your application.');
}

testStripeConfig().catch(console.error);
