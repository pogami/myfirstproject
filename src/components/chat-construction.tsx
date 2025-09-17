"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Construction, 
  MessageSquare, 
  Bot, 
  Users, 
  Clock, 
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Zap,
  Shield
} from "lucide-react";
import Link from "next/link";
import { MobileButton } from "@/components/ui/mobile-button";

export function ChatConstruction() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/20 mb-6">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-primary">Class Chat</h1>
          <Link href="/dashboard">
            <MobileButton variant="ghost" size="sm" className="h-10 px-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </MobileButton>
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl">
        {/* Main Construction Card */}
        <Card className="border-2 border-dashed border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Construction className="h-16 w-16 text-orange-500 animate-pulse" />
                <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Class Chat is Under Construction
            </CardTitle>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status Message */}
            <div className="text-center text-gray-600 text-lg">
              <p className="mb-4">
                We're working hard to bring you an amazing AI-powered class chat experience!
              </p>
              <p className="text-sm text-gray-500">
                Our team is currently refining the chat functionality to ensure the best possible experience.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-white/80 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <Bot className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-gray-800">AI Assistant</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Get instant help with homework, study tips, and academic questions from our intelligent AI tutor.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <Users className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-semibold text-gray-800">Class Collaboration</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Connect with classmates, share notes, and collaborate on group projects in real-time.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <Zap className="h-5 w-5 text-purple-500 mr-2" />
                    <h3 className="font-semibold text-gray-800">Real-time Messaging</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Fast, reliable messaging with instant notifications and seamless mobile experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 border-indigo-200">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <Shield className="h-5 w-5 text-indigo-500 mr-2" />
                    <h3 className="font-semibold text-gray-800">Secure & Private</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your conversations are protected with enterprise-grade security and privacy controls.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Indicators */}
            <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Development Progress
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">UI/UX Design</span>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AI Integration</span>
                  <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Real-time Features</span>
                  <Badge className="bg-blue-100 text-blue-800">Testing</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mobile Optimization</span>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Want to be notified when Class Chat is ready?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/newsletter">
                  <MobileButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Subscribe for Updates
                  </MobileButton>
                </Link>
                <Link href="/dashboard">
                  <MobileButton variant="outline" className="border-gray-300">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </MobileButton>
                </Link>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p>
                Expected completion: Early 2025 • 
                <span className="text-blue-600 ml-1">Follow our progress on the changelog</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
