"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, MessageSquare } from "lucide-react";

export function LiveActivityWidget() {
  return (
    <Card className="h-full bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-primary" /> Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" /> Active now
          </div>
          <span className="font-medium">—</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" /> Messages today
          </div>
          <span className="font-medium">—</span>
        </div>
        <p className="text-xs text-muted-foreground">Real-time stats coming soon.</p>
      </CardContent>
    </Card>
  );
}


