"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Construction, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MobileButton } from "@/components/ui/mobile-button";

export function ConstructionBanner() {
  return (
    <Alert className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 mb-6">
      <Construction className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <span className="font-medium text-orange-800">Class Chat is under construction!</span>
            <span className="ml-2 text-gray-600">
              We're working hard to bring you an amazing AI-powered chat experience. Expected completion: September 2025.
            </span>
          </div>
          <div className="flex gap-2">
            <Link href="/changelog">
              <MobileButton 
                variant="outline" 
                size="sm" 
                className="border-orange-300 text-orange-700 hover:bg-orange-100 h-8 px-3 text-xs"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                View Progress
              </MobileButton>
            </Link>
            <Link href="/newsletter">
              <MobileButton 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700 text-white h-8 px-3 text-xs"
              >
                Get Updates
                <ArrowRight className="h-3 w-3 ml-1" />
              </MobileButton>
            </Link>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
