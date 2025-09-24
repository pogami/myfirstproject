const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// iOS App Icon sizes required
const iosIconSizes = [
  // iPhone icons
  { filename: 'AppIcon-20@2x.png', size: 40 },    // 20x20 @2x
  { filename: 'AppIcon-20@3x.png', size: 60 },    // 20x20 @3x
  { filename: 'AppIcon-29@2x.png', size: 58 },    // 29x29 @2x
  { filename: 'AppIcon-29@3x.png', size: 87 },    // 29x29 @3x
  { filename: 'AppIcon-40@2x.png', size: 80 },    // 40x40 @2x
  { filename: 'AppIcon-40@3x.png', size: 120 },   // 40x40 @3x
  { filename: 'AppIcon-60@2x.png', size: 120 },  // 60x60 @2x
  { filename: 'AppIcon-60@3x.png', size: 180 },  // 60x60 @3x
  
  // iPad icons
  { filename: 'AppIcon-20.png', size: 20 },      // 20x20 @1x
  { filename: 'AppIcon-29.png', size: 29 },        // 29x29 @1x
  { filename: 'AppIcon-40.png', size: 40 },       // 40x40 @1x
  { filename: 'AppIcon-76.png', size: 76 },        // 76x76 @1x
  { filename: 'AppIcon-76@2x.png', size: 152 },   // 76x76 @2x
  { filename: 'AppIcon-83.5@2x.png', size: 167 }, // 83.5x83.5 @2x
  
  // App Store icon
  { filename: 'AppIcon-1024.png', size: 1024 }     // 1024x1024
];

// Create CourseConnect logo SVG
const createCourseConnectIcon = (size) => {
  const radius = size / 8; // Rounded corners
  const fontSize = size / 6; // Text size
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background gradient -->
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bgGradient)"/>
    
    <!-- Main logo text -->
    <text x="50%" y="50%" text-anchor="middle" dy="0.1em" 
          font-family="Arial, sans-serif" font-size="${fontSize}" 
          font-weight="bold" fill="url(#textGradient)">CC</text>
    
    <!-- Decorative elements -->
    <circle cx="${size * 0.25}" cy="${size * 0.25}" r="${size * 0.08}" fill="rgba(255,255,255,0.3)"/>
    <circle cx="${size * 0.75}" cy="${size * 0.75}" r="${size * 0.06}" fill="rgba(255,255,255,0.2)"/>
  </svg>`;
};

// Generate PNG icons using Sharp
const generatePNGIcons = async () => {
  const iconsDir = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
  
  console.log('Generating iOS app icons with Sharp...');
  console.log('');
  
  for (const iconInfo of iosIconSizes) {
    try {
      const svgContent = createCourseConnectIcon(iconInfo.size);
      const outputPath = path.join(iconsDir, iconInfo.filename);
      
      // Convert SVG to PNG using Sharp
      await sharp(Buffer.from(svgContent))
        .resize(iconInfo.size, iconInfo.size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${iconInfo.filename} (${iconInfo.size}x${iconInfo.size}px)`);
    } catch (error) {
      console.error(`✗ Failed to generate ${iconInfo.filename}:`, error.message);
    }
  }
  
  console.log('');
  console.log('All iOS app icons generated successfully!');
  console.log('The icons are now ready to use in your iOS app.');
};

// Run the generation
generatePNGIcons().catch(console.error);

