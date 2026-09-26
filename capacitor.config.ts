import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wbify.receiptprinter",
  appName: "Receipt Printer",
  webDir: ".vercel/output/static",
  server: {
    url: "https://receiptprinter.vercel.app",
    cleartext: false,
  },
};

export default config;
