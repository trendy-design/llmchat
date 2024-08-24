import { IVSFilterOptions } from './IVSFilterOptions';

export interface IVSSimilaritySearchParams {
  query: string;
  k?: number;
  filterOptions?: IVSFilterOptions;
  includeValues?: boolean;
}
