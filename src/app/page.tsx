
'use client';

import React from 'react';
import { Navigation } from '@/components/landing/navigation';
import { HeroSection } from '@/components/landing/modern-hero';
import { StickyCTA } from '@/components/landing/sticky-cta';
import { SocialProofSection } from '@/components/landing/modern-social-proof';
import { ScrollFeatureSection } from '@/components/landing/scroll-feature-section';
import { StickyProcessSection } from '@/components/landing/modern-process';
import { RoadmapSection } from '@/components/landing/roadmap-section';
import { FAQSection } from '@/components/landing/faq-section';
import { CTASection } from '@/components/landing/modern-cta';
import { Footer } from '@/components/landing/footer';
import { ScrollWrapper } from '@/components/landing/scroll-wrapper';

export default function HomePage() {
  return (
    <ScrollWrapper>
      <div className="min-h-screen bg-white dark:bg-gray-950" suppressHydrationWarning>
        <Navigation />
        <main className="relative">
          <HeroSection />
          <SocialProofSection />
          <ScrollFeatureSection />
          <StickyProcessSection />
          <RoadmapSection />
          <FAQSection />
          <CTASection />
        </main>
        <Footer />
        <StickyCTA />
      </div>
    </ScrollWrapper>
  );
}
