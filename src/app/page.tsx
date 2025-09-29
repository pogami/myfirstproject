
import React from 'react';
import { Navigation } from '@/components/landing/navigation';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
// Removed PricingSection from home page
import { SocialProofSection } from '@/components/landing/social-proof-section';
import { IntegrationsStrip } from '@/components/landing/integrations-strip';
// MobileAppSection removed from home page
// Mobile previews removed
// Removed DetailedPricingSection from home page
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        {/* PricingSection removed from home page */}
        <SocialProofSection />
        <IntegrationsStrip />
        {/* Mobile sections removed as requested */}
        {/* DetailedPricingSection removed from home page */}
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
