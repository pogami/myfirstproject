"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, BellOff, Smartphone, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function PushNotificationManager() {
  const [isMobile, setIsMobile] = useState(false);
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError
  } = usePushNotifications();

  const [testSent, setTestSent] = useState(false);

  // Detect if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setTestSent(false);
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
    setTestSent(false);
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  // Don't render on desktop devices
  if (!isMobile) {
    return null;
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-gray-400" />
            Push Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser doesn't support push notifications. Please use a modern mobile browser like Chrome, Firefox, or Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about CourseConnect updates on your mobile device, even when the app is closed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {isSubscribed ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Subscribed
              </Badge>
            ) : (
              <Badge variant="outline">
                <BellOff className="h-3 w-3 mr-1" />
                Not Subscribed
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Permission: {permission}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="hover:bg-transparent h-auto p-1"
              >
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {testSent && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Test notification sent! Check your device for the notification.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {!isSubscribed ? (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || permission === 'denied'}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleTestNotification}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-2" />
                Send Test
              </Button>
              <Button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Unsubscribing...
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Disable Notifications
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Permission Denied Message */}
        {permission === 'denied' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notifications are blocked. Please enable them in your browser settings:
              <br />
              • Chrome: Settings → Privacy → Site Settings → Notifications
              <br />
              • Firefox: Settings → Privacy → Notifications
              <br />
              • Safari: Preferences → Websites → Notifications
            </AlertDescription>
          </Alert>
        )}

        {/* Features List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">What you'll receive:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• New feature announcements</li>
            <li>• Important updates and bug fixes</li>
            <li>• CourseConnect news and improvements</li>
            <li>• Instant notifications on your mobile device</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
