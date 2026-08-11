
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.surativich.poliya",
  appName: "Poliya",
  webDir: "public",
  server: {
    url: "https://poliya-web.vercel.app",
    cleartext: true
  }
};

export default config;

