import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
// @ts-ignore
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
GlobalWorkerOptions.workerSrc = pdfjsWorker;

self.onmessage = async function (e) {
  const { file, documentId } = e.data;
  console.log("event", e);
  if (!(file instanceof File)) {
    self.postMessage({ error: "Invalid file", e });
    return;
  }
  const reader = new FileReader();

  reader.onload = async function (event) {
    const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);

    try {
      if (file.type === "application/pdf") {
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
        self.postMessage({
          content: pages?.reduce((acc, page) => acc + page.content, "\n\n"),
          documentId,
        });
      } else if (file.type === "text/csv" || file.type === "text/plain") {
        const text = new TextDecoder().decode(typedArray);
        self.postMessage({ content: text, documentId });
      } else {
        self.postMessage({ error: "Unsupported file type" });
      }
    } catch (error) {
      self.postMessage({ error: "Failed to load document" });
    }
  };

  reader.onerror = function () {
    self.postMessage({ error: "Failed to read file" });
  };
  reader.readAsArrayBuffer(file);
};
