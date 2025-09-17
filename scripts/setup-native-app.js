const fs = require('fs');
const path = require('path');

// Create app icons for both Android and iOS
const createAppIcons = () => {
  const androidSizes = [48, 72, 96, 144, 192];
  const iosSizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];
  
  // Create directories
  const androidDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
  const iosDir = path.join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
  
  console.log('Creating app icon directories...');
  
  // Create Android icon directories
  androidSizes.forEach(size => {
    const dir = path.join(androidDir, `mipmap-${size}dp`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create a simple SVG icon
    const svgContent = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/6}" fill="#3b82f6"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="${size/4}" fill="white" font-weight="bold">CC</text>
</svg>`;
    
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), svgContent);
    console.log(`Created Android icon: ${size}x${size}`);
  });
  
  // Create iOS icon directories
  iosSizes.forEach(size => {
    const svgContent = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/6}" fill="#3b82f6"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="${size/4}" fill="white" font-weight="bold">CC</text>
</svg>`;
    
    fs.writeFileSync(path.join(iosDir, `icon-${size}.png`), svgContent);
    console.log(`Created iOS icon: ${size}x${size}`);
  });
  
  console.log('✅ App icons created successfully!');
};

// Create app store metadata
const createAppStoreMetadata = () => {
  const metadata = {
    android: {
      packageName: 'com.courseconnect.app',
      appName: 'CourseConnect',
      version: '1.0.0',
      description: 'AI-powered study companion for college students with chat, syllabus analysis, and collaborative features',
      shortDescription: 'AI study companion for college students',
      keywords: ['education', 'study', 'AI', 'college', 'homework', 'learning'],
      category: 'EDUCATION',
      contentRating: 'EVERYONE',
      screenshots: [
        'screenshot-phone-1.png',
        'screenshot-phone-2.png',
        'screenshot-tablet-1.png'
      ]
    },
    ios: {
      bundleId: 'com.courseconnect.app',
      appName: 'CourseConnect',
      version: '1.0.0',
      description: 'AI-powered study companion for college students with chat, syllabus analysis, and collaborative features',
      shortDescription: 'AI study companion for college students',
      keywords: ['education', 'study', 'AI', 'college', 'homework', 'learning'],
      category: 'EDUCATION',
      contentRating: '4+',
      screenshots: [
        'screenshot-iphone-1.png',
        'screenshot-iphone-2.png',
        'screenshot-ipad-1.png'
      ]
    }
  };
  
  fs.writeFileSync('app-store-metadata.json', JSON.stringify(metadata, null, 2));
  console.log('✅ App store metadata created!');
};

// Main execution
console.log('🚀 CourseConnect Native App Setup');
console.log('================================');

createAppIcons();
createAppStoreMetadata();

console.log('\n📱 Next Steps:');
console.log('1. Run: npm run build:mobile');
console.log('2. Run: npm run open:android (for Android)');
console.log('3. Run: npm run open:ios (for iOS)');
console.log('4. Build and test your app!');
console.log('\n🎉 Your CourseConnect app is ready for the app stores!');
