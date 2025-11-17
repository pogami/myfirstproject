
import React from 'react';
import { Navigation } from '@/components/landing/navigation';
import { HeroSection } from '@/components/landing/hero-section';
import { ModernFeaturesShowcase } from '@/components/landing/modern-features-showcase';
import { FeaturesSection } from '@/components/landing/features-section';
// Removed PricingSection from home page
// SocialProofSection removed from home page
// MobileAppSection removed from home page
// Mobile previews removed
// Removed DetailedPricingSection from home page
// TestimonialsSection removed from home page
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';
// import { AIBot } from '@/components/ai-bot';
import { EducationComparisonSection } from '@/components/landing/education-comparison-section';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" suppressHydrationWarning>
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        
        {/* PricingSection removed from home page */}
        {/* SocialProofSection removed from home page */}
        {/* <EducationComparisonSection /> */}
        {/* Mobile sections removed as requested */}
        {/* DetailedPricingSection removed from home page */}
        {/* TestimonialsSection removed from home page */}
        <CTASection />
      </main>
      <Footer />
      {/** AIBot hidden per request */}
    </div>
  );
}
