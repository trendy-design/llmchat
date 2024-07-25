export interface ICreateEmbeddingResponse {
  object: string;
  model: string;
  data: CreateEmbeddingResponseDataInner[];
  usage: CreateEmbeddingResponseUsage;
}

interface CreateEmbeddingResponseDataInner {
  index: number;
  object: string;
  embedding: number[];
}

interface CreateEmbeddingResponseUsage {
  prompt_tokens: number;
  total_tokens: number;
}
