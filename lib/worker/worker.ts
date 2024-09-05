import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
// @ts-ignore
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
GlobalWorkerOptions.workerSrc = pdfjsWorker;

self.onmessage = async function (e) {
  const { file, documentId } = e.data;

  if (!(file instanceof File)) {
    self.postMessage({ error: "Invalid file", e });
    return;
  }
  const reader = new FileReader();

  reader.onload = async function (event) {
    const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);

    try {
      const pdf = await getDocument(typedArray).promise;
      let pages: any[] = [];
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const text = await page.getTextContent();
        pages.push({
          content: text.items.map((item: any) => item.str).join(" "),
          page: i,
        });
      }
      self.postMessage({ pages, documentId });
    } catch (error) {
      self.postMessage({ error: "Failed to load PDF document" });
    }
  };

  reader.onerror = function () {
    self.postMessage({ error: "Failed to read file" });
  };
  reader.readAsArrayBuffer(file);
};
