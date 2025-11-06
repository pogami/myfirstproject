// Script to help create optimized favicons
// You'll need to manually crop final-logo.png to remove transparent padding
// and make the blue design fill 80% of the canvas, then save as:
// - favicon-32x32.png (32x32 pixels)
// - favicon-16x16.png (16x16 pixels)

const fs = require('fs');
const path = require('path');

console.log('=== FAVICON CREATION GUIDE ===');
console.log('');
console.log('1. Open final-logo.png in an image editor (Photoshop, GIMP, Canva, etc.)');
console.log('2. Crop the image to remove all transparent padding around the edges');
console.log('3. Make sure the blue design fills at least 80% of the canvas');
console.log('4. Export as two sizes:');
console.log('   - favicon-32x32.png (32x32 pixels)');
console.log('   - favicon-16x16.png (16x16 pixels)');
console.log('5. Save both files in the public/ folder');
console.log('');
console.log('Current final-logo.png size:', fs.statSync('public/final-logo.png').size, 'bytes');
console.log('');
console.log('After creating the files, run: node update-favicon-config.js');
