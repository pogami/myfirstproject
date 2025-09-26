'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SchoolEmailVerificationProps {
  onVerified: (email: string) => void;
  onCancel: () => void;
}

export function SchoolEmailVerification({ onVerified, onCancel }: SchoolEmailVerificationProps) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  // Validate .edu email
  const isValidSchoolEmail = (email: string) => {
    return email.toLowerCase().endsWith('.edu') && email.includes('@');
  };

  // Send verification code
  const sendVerificationCode = async () => {
    if (!isValidSchoolEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid School Email",
        description: "Please enter a valid .edu email address.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-school-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('code');
        setCountdown(60); // 60 second countdown
        startCountdown();
        toast({
          title: "Verification Code Sent!",
          description: `Check your ${email} inbox for the verification code.`,
        });
      } else {
        throw new Error(data.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to send verification code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start countdown timer
  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend verification code
  const resendCode = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/send-school-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60);
        startCountdown();
        toast({
          title: "Code Resent!",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        throw new Error(data.error || 'Failed to resend code');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to resend code. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Verify code
  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-school-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email Verified!",
          description: "Your school email has been successfully verified.",
        });
        onVerified(email);
      } else {
        throw new Error(data.error || 'Invalid verification code');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || 'Invalid code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Verify School Email</CardTitle>
          <CardDescription>
            Enter your .edu email address to receive a verification code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">School Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your.name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            {email && !isValidSchoolEmail(email) && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Email must end with .edu</span>
              </div>
            )}
            {email && isValidSchoolEmail(email) && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Valid school email</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={sendVerificationCode}
              disabled={!isValidSchoolEmail(email) || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Code'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <Badge variant="secondary">{email}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep('email')}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={verifyCode}
            disabled={code.length !== 6 || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={resendCode}
            disabled={countdown > 0 || isResending}
            className="text-sm"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Resending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Code'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
