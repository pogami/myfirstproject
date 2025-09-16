import React from 'react';
import { FormattedMessage } from '../../components/formatted-message';

export default function MarkdownCleanTest() {
  const testText = `Core Concept:
In calculus, the concept of a limit is fundamental to understanding instantaneous rate of change.

Step-by-Step Process:
1. **Slope of Secant Line**: To understand instantaneous rate of change, we first consider the average rate of change over an interval.
2. **Approaching Instantaneous Rate**: By calculating the slope of secant lines for smaller and smaller intervals around a point.
3. **Definition of Instantaneous Rate**: The instantaneous rate of change of a function at a point is defined as the limit.

Examples:
Consider the function $f(x) = x^2$. To find the instantaneous rate of change at a point, say at $x = 2$, we calculate the slope of the tangent line.

Applications:
1. **Physics**: In physics, instantaneous velocity is determined using calculus.
2. **Economics**: Calculus is used to analyze marginal functions.

Common Mistakes:
1. **Confusing Average and Instantaneous Rate**: It's crucial to understand the distinction.
2. **Not Taking the Limit**: Failing to take the limit as the interval approaches zero.

Practice Suggestions:
1. Practice finding the instantaneous rate of change for different functions.
2. Work on problems involving both slope of secant lines and slope of tangent lines.

Related Topics:
1. **Derivatives**: Derivatives in calculus are closely related to instantaneous rate of change.
2. **Tangent Lines**: Understanding tangent lines helps grasp the concept further.`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Markdown Cleaning Test</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Before (With Markdown)</h2>
            <div className="bg-gray-100 p-4 rounded border">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {testText}
              </pre>
            </div>
          </div>

          {/* After */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">After (Clean Formatting)</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <FormattedMessage text={testText} />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Key Improvements:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Automatically removes **bold** formatting</li>
            <li>• Removes ## headers and other markdown symbols</li>
            <li>• Renders mathematical expressions properly</li>
            <li>• Maintains clean, readable text formatting</li>
            <li>• Works even if AI generates markdown by mistake</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
