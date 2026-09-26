export async function saveReceiptImage(element: HTMLElement, transaction: string) {
  const { toBlob, toPng } = await import("html-to-image");
  const { saveImageToAndroidGallery } = await import("./thermal-printer");
  const options = {
    pixelRatio: 2,
    backgroundColor: getComputedStyle(element).backgroundColor,
    cacheBust: true,
  };
  const fileName = `receipt-${transaction}.png`;
  const dataUrl = await toPng(element, options);
  if (await saveImageToAndroidGallery(dataUrl, fileName)) return;

  const blob = await toBlob(element, {
    ...options,
  });
  if (!blob) throw new Error("Could not create the receipt image.");

  const file = new File([blob], fileName, { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Receipt" });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // If the share sheet is unavailable, download the same image instead.
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
