"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { checkFirebaseConnection, reconnectFirebase } from "@/lib/firebase/client-simple";

export function FirebaseDebug() {
  const [isOnline, setIsOnline] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setFirebaseStatus('checking');
    setIsOnline(navigator.onLine);
    
    try {
      const isConnected = await checkFirebaseConnection();
      setFirebaseStatus(isConnected ? 'online' : 'offline');
    } catch (error) {
      setFirebaseStatus('offline');
    }
    
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      checkStatus();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setFirebaseStatus('offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="size-5" />
          Firebase Status
        </CardTitle>
        <CardDescription>
          Check your Firebase connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Internet Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Internet Connection</span>
          <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
            {isOnline ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Firebase Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Firebase Connection</span>
          <Badge 
            variant={firebaseStatus === 'online' ? "default" : firebaseStatus === 'offline' ? "destructive" : "secondary"}
            className="flex items-center gap-1"
          >
            {firebaseStatus === 'online' ? (
              <CheckCircle className="size-3" />
            ) : firebaseStatus === 'offline' ? (
              <XCircle className="size-3" />
            ) : (
              <RefreshCw className="size-3 animate-spin" />
            )}
            {firebaseStatus === 'checking' ? 'Checking...' : firebaseStatus === 'online' ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <div className="text-xs text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkStatus}
            disabled={firebaseStatus === 'checking'}
            className="flex-1"
          >
            <RefreshCw className={`size-4 mr-2 ${firebaseStatus === 'checking' ? 'animate-spin' : ''}`} />
            Check Now
          </Button>
          
          {firebaseStatus === 'offline' && (
            <Button 
              size="sm" 
              onClick={reconnectFirebase}
              className="flex-1"
            >
              Reconnect
            </Button>
          )}
        </div>

        {/* Debug Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
          <div>Port: {typeof window !== 'undefined' ? window.location.port : 'N/A'}</div>
          <div>Protocol: {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</div>
        </div>
      </CardContent>
    </Card>
  );
}
