import { Metadata } from 'next';
import { generateDashboardMeta } from '@/lib/open-graph';

export const metadata: Metadata = generateDashboardMeta();
