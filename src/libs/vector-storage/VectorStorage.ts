import { IDBPDatabase, openDB } from "idb/with-async-ittr";
import { constants } from "./common/constants";
import { filterDocuments, getObjectSizeInMB } from "./common/helpers";
import { ICreateEmbeddingResponse } from "./types/ICreateEmbeddingResponse";
import { IVSDocument, IVSSimilaritySearchItem } from "./types/IVSDocument";
import { IVSOptions } from "./types/IVSOptions";
import { IVSSimilaritySearchParams } from "./types/IVSSimilaritySearchParams";

export class VectorStorage<T> {
  private db!: IDBPDatabase<any>;
  private documents: Array<IVSDocument<T>> = [];
  private readonly maxSizeInMB: number;
  private readonly debounceTime: number;
  private readonly openaiModel: string;
  private readonly openaiApiKey?: string;
  private readonly embedTextsFn: (texts: string[]) => Promise<number[][]>;

  constructor(options: IVSOptions = {}) {
    this.maxSizeInMB = options.maxSizeInMB ?? constants.DEFAULT_MAX_SIZE_IN_MB;
    this.debounceTime = options.debounceTime ?? constants.DEFAULT_DEBOUNCE_TIME;
    this.openaiModel = options.openaiModel ?? constants.DEFAULT_OPENAI_MODEL;
    this.embedTextsFn = options.embedTextsFn ?? this.embedTexts; // Use the custom function if provided, else use the default one
    this.openaiApiKey = options.openAIApiKey;
    if (!this.openaiApiKey && !options.embedTextsFn) {
      console.error(
        "VectorStorage: pass as an option either an OpenAI API key or a custom embedTextsFn function.",
      );
    } else {
      this.loadFromIndexDbStorage();
    }
  }

  public async addText(text: string, metadata: T): Promise<IVSDocument<T>> {
    // Create a document from the text and metadata
    const doc: IVSDocument<T> = {
      metadata,
      text,
      timestamp: Date.now(),
      vector: [],
      vectorMag: 0,
    };
    const docs = await this.addDocuments([doc]);
    return docs[0];
  }

  public async addTexts(
    texts: string[],
    metadatas: T[],
  ): Promise<Array<IVSDocument<T>>> {
    if (texts.length !== metadatas.length) {
      throw new Error("The lengths of texts and metadata arrays must match.");
    }
    const docs: Array<IVSDocument<T>> = texts.map((text, index) => ({
      metadata: metadatas[index],
      text,
      timestamp: Date.now(),
      vector: [],
      vectorMag: 0,
    }));
    return await this.addDocuments(docs);
  }

  public async similaritySearch(params: IVSSimilaritySearchParams): Promise<{
    similarItems: Array<IVSSimilaritySearchItem<T>>;
    query: { text: string; embedding: number[] };
  }> {
    const { query, k = 4, filterOptions, includeValues } = params;
    const queryEmbedding = await this.embedText(query);
    const queryMagnitude = await this.calculateMagnitude(queryEmbedding);
    const filteredDocuments = filterDocuments(this.documents, filterOptions);
    const scoresPairs: Array<[IVSDocument<T>, number]> =
      this.calculateSimilarityScores(
        filteredDocuments,
        queryEmbedding,
        queryMagnitude,
      );
    const sortedPairs = scoresPairs.sort((a, b) => b[1] - a[1]);
    const results = sortedPairs
      .slice(0, k)
      .map((pair) => ({ ...pair[0], score: pair[1] }));
    this.updateHitCounters(results);
    if (results.length > 0) {
      this.removeDocsLRU();
      await this.saveToIndexDbStorage();
    }
    if (!includeValues) {
      results.forEach((result) => {
        delete result.vector;
        delete result.vectorMag;
      });
    }
    return {
      query: { embedding: queryEmbedding, text: query },
      similarItems: results,
    };
  }

  private async initDB(): Promise<IDBPDatabase<any>> {
    return await openDB<any>("VectorStorageDatabase", undefined, {
      upgrade(db) {
        const documentStore = db.createObjectStore("documents", {
          autoIncrement: true,
          keyPath: "id",
        });
        documentStore.createIndex("text", "text", { unique: true });
        documentStore.createIndex("metadata", "metadata");
        documentStore.createIndex("timestamp", "timestamp");
        documentStore.createIndex("vector", "vector");
        documentStore.createIndex("vectorMag", "vectorMag");
        documentStore.createIndex("hits", "hits");
      },
    });
  }

  private async addDocuments(
    documents: Array<IVSDocument<T>>,
  ): Promise<Array<IVSDocument<T>>> {
    // filter out already existing documents
    const newDocuments = documents.filter(
      (doc) => !this.documents.some((d) => d.text === doc.text),
    );
    // If there are no new documents, return an empty array
    if (newDocuments.length === 0) {
      return [];
    }
    const newVectors = await this.embedTextsFn(
      newDocuments.map((doc) => doc.text),
    );
    // Assign vectors and precompute vector magnitudes for new documents
    newDocuments.forEach((doc, index) => {
      doc.vector = newVectors[index];
      doc.vectorMag = calcVectorMagnitude(doc);
    });
    // Add new documents to the store
    this.documents.push(...newDocuments);
    this.removeDocsLRU();
    // Save to index db storage
    await this.saveToIndexDbStorage();
    return newDocuments;
  }

  private async embedTexts(texts: string[]): Promise<number[][]> {
    const response = await fetch(constants.OPENAI_API_URL, {
      body: JSON.stringify({
        input: texts,
        model: this.openaiModel,
      }),
      headers: {
        Authorization: `Bearer ${this.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = (await response.json()) as ICreateEmbeddingResponse;
    return responseData.data.map((data) => data.embedding);
  }

  private async embedText(query: string): Promise<number[]> {
    return (await this.embedTextsFn([query]))[0];
  }

  private calculateMagnitude(embedding: number[]): number {
    const queryMagnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0),
    );
    return queryMagnitude;
  }

  private calculateSimilarityScores(
    filteredDocuments: Array<IVSDocument<T>>,
    queryVector: number[],
    queryMagnitude: number,
  ): Array<[IVSDocument<T>, number]> {
    return filteredDocuments.map((doc) => {
      const dotProduct = doc.vector!.reduce(
        (sum, val, i) => sum + val * queryVector[i],
        0,
      );
      let score = getCosineSimilarityScore(
        dotProduct,
        doc.vectorMag!,
        queryMagnitude,
      );
      score = normalizeScore(score); // Normalize the score
      return [doc, score];
    });
  }

  private updateHitCounters(results: Array<IVSDocument<T>>): void {
    results.forEach((doc) => {
      doc.hits = (doc.hits ?? 0) + 1; // Update hit counter
    });
  }

  private async loadFromIndexDbStorage(): Promise<void> {
    if (!this.db) {
      this.db = await this.initDB();
    }
    this.documents = await this.db.getAll("documents");
    this.removeDocsLRU();
  }

  private async saveToIndexDbStorage(): Promise<void> {
    if (!this.db) {
      this.db = await this.initDB();
    }
    try {
      const tx = this.db.transaction("documents", "readwrite");
      await tx.objectStore("documents").clear();
      for (const doc of this.documents) {
        // eslint-disable-next-line no-await-in-loop
        await tx.objectStore("documents").put(doc);
      }
      await tx.done;
    } catch (error: any) {
      console.error("Failed to save to IndexedDB:", error.message);
    }
  }

  private removeDocsLRU(): void {
    if (getObjectSizeInMB(this.documents) > this.maxSizeInMB) {
      // Sort documents by hit counter (ascending) and then by timestamp (ascending)
      this.documents.sort(
        (a, b) => (a.hits ?? 0) - (b.hits ?? 0) || a.timestamp - b.timestamp,
      );

      // Remove documents until the size is below the limit
      while (getObjectSizeInMB(this.documents) > this.maxSizeInMB) {
        this.documents.shift();
      }
    }
  }
}

function calcVectorMagnitude(doc: IVSDocument<any>): number {
  return Math.sqrt(doc.vector!.reduce((sum, val) => sum + val * val, 0));
}

function getCosineSimilarityScore(
  dotProduct: number,
  magnitudeA: number,
  magnitudeB: number,
): number {
  return dotProduct / (magnitudeA * magnitudeB);
}

function normalizeScore(score: number): number {
  return (score + 1) / 2;
}
