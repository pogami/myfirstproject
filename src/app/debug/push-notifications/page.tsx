"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Info, Bug } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export default function PushNotificationDebug() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError
  } = usePushNotifications();

  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog("Debug page loaded");
    
    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        addLog(`Service Workers registered: ${registrations.length}`);
        registrations.forEach((reg, index) => {
          addLog(`SW ${index + 1}: ${reg.scope} - ${reg.active ? 'Active' : 'Inactive'}`);
        });
      });
    }

    // Check push manager support
    if ('PushManager' in window) {
      addLog("PushManager is supported");
    } else {
      addLog("PushManager is NOT supported");
    }

    // Check notification permission
    addLog(`Notification permission: ${Notification.permission}`);

    // Check if we're on HTTPS
    addLog(`Protocol: ${window.location.protocol}`);
    addLog(`Host: ${window.location.host}`);
  }, []);

  const handleSubscribe = async () => {
    addLog("Attempting to subscribe...");
    const success = await subscribe();
    addLog(success ? "Subscription successful!" : "Subscription failed!");
  };

  const handleTestNotification = async () => {
    addLog("Sending test notification...");
    const success = await sendTestNotification();
    addLog(success ? "Test notification sent!" : "Test notification failed!");
  };

  const handleUnsubscribe = async () => {
    addLog("Unsubscribing...");
    const success = await unsubscribe();
    addLog(success ? "Unsubscribed successfully!" : "Unsubscribe failed!");
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Bug className="h-3 w-3 mr-1" />
              Debug Mode
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Push Notification Debug
            </h1>
            <p className="text-xl text-gray-600">
              Debug and troubleshoot push notification issues
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Push Support:</span>
                  <Badge variant={isSupported ? "default" : "destructive"}>
                    {isSupported ? "Supported" : "Not Supported"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Permission:</span>
                  <Badge variant={permission === 'granted' ? "default" : permission === 'denied' ? "destructive" : "secondary"}>
                    {permission}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Subscription:</span>
                  <Badge variant={isSubscribed ? "default" : "secondary"}>
                    {isSubscribed ? "Subscribed" : "Not Subscribed"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Loading:</span>
                  <Badge variant={isLoading ? "default" : "secondary"}>
                    {isLoading ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Protocol:</span>
                  <Badge variant={window.location.protocol === 'https:' ? "default" : "destructive"}>
                    {window.location.protocol}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleSubscribe}
                  disabled={isLoading || !isSupported || permission === 'denied'}
                  className="w-full"
                >
                  {isLoading ? "Subscribing..." : "Subscribe to Notifications"}
                </Button>
                
                <Button 
                  onClick={handleTestNotification}
                  disabled={isLoading || !isSubscribed}
                  variant="outline"
                  className="w-full"
                >
                  Send Test Notification
                </Button>
                
                <Button 
                  onClick={handleUnsubscribe}
                  disabled={isLoading || !isSubscribed}
                  variant="destructive"
                  className="w-full"
                >
                  Unsubscribe
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Debug Logs */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Debug Logs
                </span>
                <Button variant="outline" size="sm" onClick={clearLogs}>
                  Clear Logs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
