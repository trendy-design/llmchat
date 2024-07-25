export type TDocument = {
  id: string;
  content: File | string;
  isIndexed: boolean;
  meta: any;
  createdAt: Date;
  updatedAt: Date;
};
