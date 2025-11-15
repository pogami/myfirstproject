
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
import TestPDF from '@/components/test-pdf-upload';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" suppressHydrationWarning>
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        
        {/* PDF Upload Test Section */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto">
            <TestPDF />
          </div>
        </section>
        
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
