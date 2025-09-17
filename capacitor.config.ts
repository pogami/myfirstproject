import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.courseconnect.app',
  appName: 'CourseConnect',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
