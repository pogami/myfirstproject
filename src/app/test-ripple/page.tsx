"use client";

import { useState } from 'react';
import { RippleText } from '@/components/ripple-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RippleTestPage() {
  const [showAnimation, setShowAnimation] = useState(false);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ripple Animation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setShowAnimation(!showAnimation)}
            className="w-full"
          >
            {showAnimation ? 'Hide' : 'Show'} Ripple Animation
          </Button>
          
          {showAnimation && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <h3 className="text-sm font-medium mb-2">AI Thinking Animation:</h3>
                <RippleText text="thinking..." className="text-xs opacity-70" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">AI is thinking:</h3>
                <RippleText text="AI is thinking..." className="text-xs opacity-70" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Loading:</h3>
                <RippleText text="Loading..." className="text-sm text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Processing:</h3>
                <RippleText text="Processing your request..." className="text-sm" />
              </div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>This page tests the ripple animation that should appear when the AI is thinking.</p>
            <p>If you can see the animated text above, the ripple animation is working correctly.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
