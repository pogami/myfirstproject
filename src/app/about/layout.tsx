import { Metadata } from 'next';
import { generateAboutMeta } from '@/lib/open-graph';

export const metadata: Metadata = generateAboutMeta();

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
