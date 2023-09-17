import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ncreader-ionic',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
