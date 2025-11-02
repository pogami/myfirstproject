'use client';

import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import Link from 'next/link';

interface StripePaymentButtonProps {
  priceId: string;
  planName: string;
  className?: string;
}

export function StripePaymentButton({ priceId, planName, className }: StripePaymentButtonProps) {
  return (
    <Button
      asChild
      className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${className}`}
      size="lg"
    >
      <Link href="/custom-checkout">
        <CreditCard className="mr-2 h-4 w-4" />
        Subscribe to {planName}
      </Link>
    </Button>
  );
}
