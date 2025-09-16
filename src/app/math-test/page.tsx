import React from 'react';
import { FormattedMessage } from '../../components/formatted-message';

export default function MathTest() {
  const mathExample = `Core Concept:
A derivative represents the instantaneous rate of change of a function at a specific point.

Step-by-Step Process:
1. Consider the function $f(x) = x^2$
2. To find the derivative at $x = 3$, we use the limit definition:
   $$f'(3) = \lim_{h \to 0} \frac{(3+h)^2 - 3^2}{h}$$
3. Expand and simplify:
   $$f'(3) = \lim_{h \to 0} \frac{9 + 6h + h^2 - 9}{h} = \lim_{h \to 0} (6 + h) = 6$$

Examples:
- For $f(x) = x^2$, the derivative is $f'(x) = 2x$
- At $x = 3$: $f'(3) = 2(3) = 6$
- The slope of the tangent line at $x = 3$ is 6

Applications:
- Physics: velocity as derivative of position
- Economics: marginal cost as derivative of total cost
- Engineering: rate of change in system responses

Common Mistakes:
- Confusing average rate of change with instantaneous rate of change
- Forgetting to take the limit as $h \to 0$

Practice Suggestions:
- Practice with polynomial functions like $f(x) = x^3$ or $f(x) = x^4$
- Work on finding derivatives at specific points
- Graph functions and their derivatives to visualize the relationship

Related Topics:
- Integration (antiderivatives)
- Chain rule and product rule
- Applications in optimization problems`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Math Rendering Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Before (Raw LaTeX)</h2>
          <div className="bg-gray-100 p-4 rounded border mb-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {mathExample}
            </pre>
          </div>

          <h2 className="text-xl font-semibold mb-4">After (Rendered Math)</h2>
          <div className="bg-gray-50 p-4 rounded border">
            <FormattedMessage text={mathExample} />
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Key Improvements:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Mathematical expressions are now properly rendered</li>
            <li>• Fractions, limits, and exponents display correctly</li>
            <li>• Inline math ($...$) and block math ($$...$$) supported</li>
            <li>• Professional mathematical notation</li>
            <li>• Easy to read and understand</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
