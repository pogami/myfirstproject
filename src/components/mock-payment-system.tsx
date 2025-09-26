'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Building2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'apple',
    name: 'Apple Pay',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Touch ID or Face ID'
  },
  {
    id: 'google',
    name: 'Google Pay',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Fingerprint or PIN'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Direct from your bank account'
  }
];

export function MockPaymentSystem() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock validation
    if (cardNumber.length < 16) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Invalid card number",
      });
      setIsProcessing(false);
      return;
    }
    
    // Mock success
    toast({
      title: "Payment Successful!",
      description: "This is just a demo - no real money was charged",
    });
    
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Warning Banner */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Demo Only</span>
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
          This is a mock payment system for demonstration purposes. No real payments are processed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mock Payment System</CardTitle>
          <p className="text-muted-foreground">
            This shows what a custom payment system would look like (without real processing)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Methods */}
          <div>
            <Label className="text-base font-semibold">Choose Payment Method</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={selectedMethod === method.id ? "default" : "outline"}
                  onClick={() => setSelectedMethod(method.id)}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  {method.icon}
                  <span className="font-medium">{method.name}</span>
                  <span className="text-xs text-muted-foreground">{method.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Card Details Form */}
          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  maxLength={16}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setExpiry(value.replace(/(\d{2})(\d{0,2})/, '$1/$2'));
                      }
                    }}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Scholar Plan</span>
              <span className="font-semibold">$4.99/month</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">14-day free trial</span>
              <span className="text-sm text-green-600 font-medium">$0.00</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Today</span>
                <span className="text-lg font-bold text-green-600">$0.00</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                After trial: $4.99/month • Cancel anytime
              </p>
            </div>
          </div>

          {/* Process Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment (Demo)
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              🔒 This is a demonstration only • No real payments are processed
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


