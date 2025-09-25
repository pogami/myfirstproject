import { Metadata } from 'next';
import { generatePricingMeta } from '@/lib/open-graph';

export const metadata: Metadata = generatePricingMeta();

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
