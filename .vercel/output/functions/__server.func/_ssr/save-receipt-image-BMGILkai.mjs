//#region node_modules/.nitro/vite/services/ssr/assets/save-receipt-image-BMGILkai.js
async function saveReceiptImage(element, transaction) {
	const { toBlob } = await import("../_libs/html-to-image.mjs").then((n) => n.t);
	const blob = await toBlob(element, {
		pixelRatio: 2,
		backgroundColor: getComputedStyle(element).backgroundColor,
		cacheBust: true
	});
	if (!blob) throw new Error("Could not create the receipt image.");
	const file = new File([blob], `receipt-${transaction}.png`, { type: "image/png" });
	if (navigator.share && navigator.canShare?.({ files: [file] })) try {
		await navigator.share({
			files: [file],
			title: "Receipt"
		});
		return;
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") return;
	}
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = file.name;
	document.body.append(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 6e4);
}
//#endregion
export { saveReceiptImage as t };
