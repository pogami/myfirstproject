"use client";

import { useState } from "react";
import { storage } from "@/lib/firebase/client-simple";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestStoragePage() {
    const [testResult, setTestResult] = useState<string>("");
    const [isTesting, setIsTesting] = useState(false);

    const testStorage = async () => {
        setIsTesting(true);
        setTestResult("Testing Firebase Storage...");
        
        try {
            // Create a simple test file
            const testContent = "Hello Firebase Storage!";
            const testFile = new File([testContent], "test.txt", { type: "text/plain" });
            
            // Try to upload
            const testRef = ref(storage, "test/test-file.txt");
            setTestResult("Uploading test file...");
            
            await uploadBytes(testRef, testFile);
            setTestResult("Upload successful! Getting download URL...");
            
            const downloadURL = await getDownloadURL(testRef);
            setTestResult(`✅ SUCCESS! Download URL: ${downloadURL}`);
            
        } catch (error) {
            setTestResult(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error("Storage test error:", error);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Firebase Storage Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button 
                        onClick={testStorage} 
                        disabled={isTesting}
                        className="w-full"
                    >
                        {isTesting ? "Testing..." : "Test Storage Connection"}
                    </Button>
                    
                    {testResult && (
                        <div className="p-4 bg-muted rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
