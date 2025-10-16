// Script to update favicon configuration after creating optimized favicons
const fs = require('fs');

// Check if optimized favicons exist
const favicon32 = 'public/favicon-32x32.png';
const favicon16 = 'public/favicon-16x16.png';

if (fs.existsSync(favicon32) && fs.existsSync(favicon16)) {
  console.log('✅ Optimized favicons found!');
  console.log('32x32:', fs.statSync(favicon32).size, 'bytes');
  console.log('16x16:', fs.statSync(favicon16).size, 'bytes');
  
  // Update layout.tsx with optimized favicons
  const layoutPath = 'src/app/layout.tsx';
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  // Replace favicon references
  layoutContent = layoutContent.replace(
    /href="\/final-logo\.png\?v=1"/g,
    'href="/favicon-32x32.png?v=2"'
  );
  
  layoutContent = layoutContent.replace(
    /href="\/final-logo\.png"/g,
    'href="/favicon-32x32.png?v=2"'
  );
  
  // Add 16x16 favicon for smaller displays
  layoutContent = layoutContent.replace(
    '<link rel="icon" href="/favicon-32x32.png?v=2" type="image/png" sizes="any" />',
    '<link rel="icon" href="/favicon-32x32.png?v=2" type="image/png" sizes="32x32" />\n        <link rel="icon" href="/favicon-16x16.png?v=2" type="image/png" sizes="16x16" />'
  );
  
  fs.writeFileSync(layoutPath, layoutContent);
  console.log('✅ Updated layout.tsx with optimized favicons');
  
} else {
  console.log('❌ Optimized favicons not found!');
  console.log('Please create:');
  console.log('- public/favicon-32x32.png');
  console.log('- public/favicon-16x16.png');
  console.log('');
  console.log('Then run this script again.');
}
