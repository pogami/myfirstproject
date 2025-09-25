import { Metadata } from 'next';
import { generateHomepageMeta } from '@/lib/open-graph';

export const metadata: Metadata = generateHomepageMeta();

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
