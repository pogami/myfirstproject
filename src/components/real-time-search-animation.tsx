"use client";

import { useState, useEffect } from 'react';
import { Search, Globe, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { RippleText } from './ripple-text';

interface SearchStep {
  id: string;
  title: string;
  status: 'searching' | 'found' | 'failed';
  source: string;
  data?: string;
  timestamp: string;
}

interface RealTimeSearchAnimationProps {
  query: string;
  onComplete: (results: SearchStep[]) => void;
  isVisible: boolean;
}

export function RealTimeSearchAnimation({ query, onComplete, isVisible }: RealTimeSearchAnimationProps) {
  const [searchSteps, setSearchSteps] = useState<SearchStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const steps: SearchStep[] = [
      {
        id: '1',
        title: 'Searching Google for real-time results...',
        status: 'searching',
        source: 'Google Custom Search',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: '2',
        title: 'Analyzing current information...',
        status: 'searching',
        source: 'Google Search Results',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: '3',
        title: 'Processing real-time data...',
        status: 'searching',
        source: 'Google API',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: '4',
        title: 'Generating current response...',
        status: 'searching',
        source: 'AI Processing',
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    setSearchSteps(steps);
    setCurrentStep(0);

    // Simulate real-time search progression
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          // Mark current step as found or failed
          setSearchSteps(current => 
            current.map((step, index) => 
              index === prev 
                ? { 
                    ...step, 
                    status: Math.random() > 0.2 ? 'found' : 'failed',
                    data: Math.random() > 0.2 ? `Found relevant data: ${step.source} search completed` : undefined
                  }
                : step
            )
          );
          return prev + 1;
        } else {
          // Complete the search
          setSearchSteps(current => 
            current.map((step, index) => 
              index === prev 
                ? { 
                    ...step, 
                    status: 'found',
                    data: `Search completed: Found current information from ${step.source}`
                  }
                : step
            )
          );
          clearInterval(interval);
          setTimeout(() => onComplete(searchSteps), 1000);
          return prev;
        }
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isVisible, query, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Real-Time Search</h3>
            <RippleText text={`Searching for: "${query}"`} className="text-sm text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        <div className="space-y-3">
          {searchSteps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                index < currentStep 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : index === currentStep
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex-shrink-0">
                {step.status === 'searching' && index === currentStep && (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
                {step.status === 'found' && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {step.status === 'failed' && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                {step.status === 'searching' && index !== currentStep && (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {step.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{step.source}</span>
                  <Clock className="w-3 h-3 text-gray-500 ml-2" />
                  <span className="text-xs text-gray-500">{step.timestamp}</span>
                </div>
                {step.data && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {step.data}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Searching the web in real-time for the most current information...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
