import { TDocument } from "@/lib/types";
import { generateShortUUID } from "@/lib/utils/utils";
import { get, set } from "idb-keyval";

class DocumentService {
  key = "documents";

  async getDocuments(): Promise<TDocument[]> {
    return (await get(this.key)) || [];
  }

  async createDocument(document: Omit<TDocument, "id">): Promise<TDocument> {
    const documents = await this.getDocuments();
    const newDocument = { ...document, id: generateShortUUID() };
    const newDocuments = [...documents, newDocument];
    await set(this.key, newDocuments);
    return newDocument;
  }

  async deleteDocument(id: string) {
    const documents = await this.getDocuments();
    const newDocuments = documents.filter((document) => document.id !== id);
    await set(this.key, newDocuments);
  }

  async updateDocument(
    documentKey: string,
    newDocument: Omit<Partial<TDocument>, "id">,
  ) {
    const documents = await this.getDocuments();
    const newDocuments = documents.map((document) =>
      document.id === documentKey ? { ...document, ...newDocument } : document,
    );
    await set(this.key, newDocuments);
  }
}

export const documentService = new DocumentService();
