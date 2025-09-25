// Helper function to detect if content contains mathematical or physics-related content
export function isMathOrPhysicsContent(content: string): boolean {
  const mathPatterns = [
    // LaTeX math delimiters
    /\$[^$]+\$/g,           // Inline math: $...$
    /\$\$[^$]+\$\$/g,       // Block math: $$...$$
    /\\[a-zA-Z]+\{[^}]*\}/g, // LaTeX commands: \command{...}
    
    // Math operators and symbols
    /[+\-*/=<>≤≥≠]/g,      // Math operators
    /[0-9]+\s*[+\-*/]\s*[0-9]+/g, // Simple arithmetic
    /[a-zA-Z]\^[0-9]+/g,   // Exponents
    /sqrt\s*\([^)]+\)/gi,  // Square roots
    /integral|derivative|limit|sum|product/gi, // Calculus terms
    
    // Physics and science terms
    /\b(physics|force|velocity|acceleration|momentum|energy|work|power|mass|weight|gravity|electric|magnetic|wave|frequency|wavelength|quantum|thermodynamics|kinematics|dynamics|mechanics|optics|electromagnetism)\b/i,
    
    // Math keywords
    /\b(solve|calculate|find|equation|formula|theorem|proof|algebra|geometry|trigonometry|calculus|statistics|probability|matrix|vector|function|graph|plot|coordinate|axis|slope|intercept|optimize|maximize|minimize|volume|area|perimeter|surface|area|rectangular|box|cardboard|cutting|folding)\b/i,
    
    // Chemical formulas and equations
    /[A-Z][a-z]?\d*/g,     // Chemical formulas like H2O, CO2
    /\b(chemical|reaction|molecule|atom|element|compound|solution|concentration|pH|acid|base)\b/i,
    
    // Units and measurements
    /\b(meter|kilogram|second|ampere|kelvin|mole|candela|newton|joule|watt|volt|ohm|hertz|pascal|tesla|farad|henry|siemens|weber|gray|becquerel|sievert)\b/i,
    /\b(m|kg|s|A|K|mol|cd|N|J|W|V|Ω|Hz|Pa|T|F|H|S|Wb|Gy|Bq|Sv)\b/g,
    
    // Mathematical notation
    /\b(sin|cos|tan|log|ln|exp|pi|e|infinity|limit|integral|sum|product|sigma|alpha|beta|gamma|delta|theta|lambda|mu|nu|xi|rho|sigma|tau|phi|chi|psi|omega)\b/i
  ];
  
  return mathPatterns.some(pattern => pattern.test(content));
}
