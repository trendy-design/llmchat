// import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
// // @ts-ignore
// import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

// // Set the workerSrc for pdfjs-dist
// GlobalWorkerOptions.workerSrc = pdfjsWorker;

// // Listen for messages from the main thread
// self.onmessage = async function (e) {
//   const file = e.data;

//   console.log("new file", file);

//   // Check if the data is a valid File object
//   if (!(file instanceof File)) {
//     self.postMessage({ error: "Invalid file" });
//     return;
//   }

//   // Use FileReader to read the file
//   const reader = new FileReader();

//   reader.onload = async function (event) {
//     console.log(event);

//     // Convert the result to a Uint8Array
//     const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
//     console.log("typedArray", typedArray);

//     try {
//       // Load the PDF document
//       const pdf = await getDocument(typedArray).promise;
//       let textContent = "";

//       console.log("pdf", pdf);

//       // Extract text from each page
//       for (let i = 0; i < pdf.numPages; i++) {
//         const page = await pdf.getPage(i + 1); // Pages are 1-indexed in pdfjs-dist
//         const text = await page.getTextContent();
//         textContent += text.items.map((item: any) => item.str).join(" ");
//       }

//       // Send the extracted text back to the main thread
//       self.postMessage({ content: textContent });
//     } catch (error) {
//       self.postMessage({ error: "Failed to load PDF document" });
//     }
//   };

//   reader.onerror = function () {
//     self.postMessage({ error: "Failed to read file" });
//   };

//   // Read the file as an ArrayBuffer
//   reader.readAsArrayBuffer(file);
// };
