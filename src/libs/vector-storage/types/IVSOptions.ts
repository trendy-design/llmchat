export interface IVSOptions {
  openAIApiKey?: string; // The OpenAI API key used for generating embeddings.
  maxSizeInMB?: number; // The maximum size of the storage in megabytes. Defaults to 4.8. Cannot exceed 5.
  debounceTime?: number; // The debounce time in milliseconds for saving to local storage. Defaults to 0.
  openaiModel?: string; // The OpenAI model used for generating embeddings. Defaults to 'text-embedding-ada-002'.
  embedTextsFn?: (texts: string[]) => Promise<number[][]>; // Option for custom embedding function
}
