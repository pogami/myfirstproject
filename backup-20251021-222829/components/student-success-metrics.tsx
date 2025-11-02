'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, CheckCircle, Target } from "lucide-react";

interface StudentSuccessMetricsProps {
  className?: string;
}

export function StudentSuccessMetrics({ className }: StudentSuccessMetricsProps) {
  // Focus on actual features being built
  const metrics = [
    {
      label: "AI Chat",
      description: "Intelligent study assistance",
      icon: Users,
      color: "text-blue-400"
    },
    {
      label: "Syllabus Analysis", 
      description: "Smart course planning",
      icon: Target,
      color: "text-blue-400"
    },
    {
      label: "Study Tools",
      description: "Coming soon",
      icon: TrendingUp,
      color: "text-blue-400"
    }
  ];

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-gray-800 text-white border-gray-700 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-white text-lg">What We're Building</CardTitle>
            <p className="text-gray-400 text-sm">Features that help students succeed</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
              <div>
                <p className="text-white font-medium">{metric.label}</p>
                <p className="text-gray-400 text-xs">{metric.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Innovation in education</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
