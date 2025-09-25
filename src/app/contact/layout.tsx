import { Metadata } from 'next';
import { generateContactMeta } from '@/lib/open-graph';

export const metadata: Metadata = generateContactMeta();

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
