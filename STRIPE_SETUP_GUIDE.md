# Stripe Payment Setup Guide

## Quick Fix for Payment Error

The "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" error occurs because your Stripe environment variables are not configured.

## Step 1: Set Up Stripe Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID=price_your_scholar_price_id_here
```

## Step 2: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)

## Step 3: Create Price IDs

1. Go to [Stripe Products](https://dashboard.stripe.com/products)
2. Create a new product called "Scholar Plan"
3. Add a recurring price of $4.99/month
4. Copy the Price ID (starts with `price_`)

## Step 4: Update Environment Variables

Replace the placeholder values in `.env.local` with your actual Stripe keys and price ID.

## Step 5: Restart Your Development Server

```bash
npm run dev
```

## Testing

1. Make sure you're in **Test Mode** in Stripe Dashboard
2. Use test card numbers like `4242 4242 4242 4242`
3. Any future date for expiry and any 3-digit CVC

## Common Issues

- **Invalid Price ID**: Make sure the price ID exists in your Stripe account
- **Wrong Environment**: Ensure you're using test keys, not live keys
- **Missing Variables**: Restart your dev server after adding environment variables


