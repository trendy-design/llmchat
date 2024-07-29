export type TDocument = {
  id: string;
  content: File | string;
  isIndexing: boolean;
  isFailed: boolean;
  isIndexed: boolean;
  meta: any;
  createdAt: Date;
  updatedAt: Date;
};
