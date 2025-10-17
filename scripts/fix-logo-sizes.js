const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createProperIcons() {
  const inputFile = path.join(__dirname, '../public/pageicon.png');
  const outputDir = path.join(__dirname, '../public');
  
  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error('❌ pageicon.png not found in public directory');
    return;
  }

  console.log('🎨 Creating proper icon sizes from pageicon.png...');

  // Icon sizes needed for different purposes
  const iconSizes = [
    // PWA Manifest icons
    { size: 192, name: 'icon-192x192.png' },
    { size: 512, name: 'icon-512x512.png' },
    
    // Apple Touch Icons
    { size: 180, name: 'apple-touch-icon.png' },
    
    // Favicons
    { size: 32, name: 'favicon-32x32.png' },
    { size: 16, name: 'favicon-16x16.png' },
    
    // Open Graph (social sharing) - should be larger
    { size: 1200, name: 'og-image.png' },
    
    // Additional PWA sizes
    { size: 144, name: 'icon-144x144.png' },
    { size: 96, name: 'icon-96x96.png' },
    { size: 72, name: 'icon-72x72.png' },
    { size: 48, name: 'icon-48x48.png' },
  ];

  try {
    // Create all icon sizes
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created ${name} (${size}x${size})`);
    }

    // Create a proper square version for PWA manifest
    await sharp(inputFile)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 } // Blue background like your theme
      })
      .png()
      .toFile(path.join(outputDir, 'app-icon-512x512.png'));

    console.log('✅ Created app-icon-512x512.png with blue background');

    // Create a smaller version for social sharing that won't be gigantic
    await sharp(inputFile)
      .resize(400, 400, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      })
      .png()
      .toFile(path.join(outputDir, 'social-icon-400x400.png'));

    console.log('✅ Created social-icon-400x400.png for social sharing');

    console.log('\n🎉 All icon sizes created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update manifest.json to use the new icon files');
    console.log('2. Update Open Graph meta tags to use social-icon-400x400.png');
    console.log('3. Test the icons in different contexts');

  } catch (error) {
    console.error('❌ Error creating icons:', error);
  }
}

// Run the script
createProperIcons();
