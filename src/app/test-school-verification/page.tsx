'use client';

import { SchoolEmailVerification } from '@/components/school-email-verification';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, GraduationCap } from 'lucide-react';

export default function TestSchoolVerificationPage() {
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">School Email Verification</h1>
          <p className="text-muted-foreground">
            Test the school email verification system
          </p>
        </div>

        {verifiedEmail ? (
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-700 dark:text-green-300">Verification Complete!</CardTitle>
              <CardDescription>
                Your school email has been successfully verified
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {verifiedEmail}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This email is now confirmed as a valid .edu address
              </p>
              <button
                onClick={() => setVerifiedEmail(null)}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Test with another email
              </button>
            </CardContent>
          </Card>
        ) : (
          <SchoolEmailVerification
            onVerified={(email) => {
              setVerifiedEmail(email);
            }}
            onCancel={() => {
              console.log('Verification cancelled');
            }}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Enter your .edu email</p>
                <p>Only email addresses ending with .edu are accepted</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Receive verification code</p>
                <p>A 6-digit code will be sent to your email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Enter the code</p>
                <p>Code expires in 10 minutes for security</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
