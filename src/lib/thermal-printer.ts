import { Capacitor, registerPlugin } from "@capacitor/core";

export type PairedPrinter = { name: string; address: string };

type ThermalPrinterPlugin = {
  listPaired(): Promise<{ devices: PairedPrinter[] }>;
  printImage(options: { address: string; dataUrl: string }): Promise<void>;
};

const ThermalPrinter = registerPlugin<ThermalPrinterPlugin>("ThermalPrinter");
const printerKey = "thermal-printer-address";

export function isThermalPrinterApp() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export async function listPairedPrinters() {
  return (await ThermalPrinter.listPaired()).devices;
}

export function selectedPrinter() {
  return typeof window === "undefined" ? "" : window.localStorage.getItem(printerKey) ?? "";
}

export function selectPrinter(address: string) {
  window.localStorage.setItem(printerKey, address);
}

export async function printReceipt(element: HTMLElement): Promise<"direct" | "browser"> {
  if (!isThermalPrinterApp()) {
    window.print();
    return "browser";
  }

  const address = selectedPrinter();
  if (!address) throw new Error("Choose your Bluetooth printer in Store Setup first.");
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: getComputedStyle(element).backgroundColor || "#ffffff",
    cacheBust: true,
  });
  await ThermalPrinter.printImage({ address, dataUrl });
  return "direct";
}
