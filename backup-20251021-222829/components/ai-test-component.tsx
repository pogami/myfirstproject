"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AITestComponent() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testAI = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: 'Test' })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResponse(`Provider: ${data.provider}\n\nAnswer: ${data.answer}`);
      } else {
        setResponse(`Error: ${data.error}\nDetails: ${data.details}`);
      }
    } catch (error) {
      setResponse(`Network Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>AI Service Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            onKeyPress={(e) => e.key === 'Enter' && testAI()}
          />
          <Button onClick={testAI} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test AI'}
          </Button>
        </div>
        {response && (
          <div className="p-3 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{response}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
