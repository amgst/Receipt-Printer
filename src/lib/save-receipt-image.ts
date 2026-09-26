export async function saveReceiptImage(element: HTMLElement, transaction: string) {
  const { toBlob } = await import("html-to-image");
  const blob = await toBlob(element, {
    pixelRatio: 2,
    backgroundColor: getComputedStyle(element).backgroundColor,
    cacheBust: true,
  });
  if (!blob) throw new Error("Could not create the receipt image.");

  const file = new File([blob], `receipt-${transaction}.png`, { type: "image/png" });
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