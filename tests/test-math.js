const line = 'For each polynomial division, we need to find the value of \\( k \\) such that the remainder is 3.';
const hasMath = line.includes('$$') || (line.includes('$') && line.includes('$')) || 
                (line.includes('\\(') && line.includes('\\)')) || 
                (line.includes('\\[') && line.includes('\\]')) ||
                line.includes('\\boxed{');

console.log('Line:', line);
console.log('hasMath:', hasMath);
console.log('Contains \\(:', line.includes('\\('));
console.log('Contains \\):', line.includes('\\)'));

// Test the regex split
const parts = line.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([^)]*?\\\)|\\boxed\{[^}]*\})/);
console.log('Parts:', parts);
