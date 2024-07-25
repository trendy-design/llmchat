export interface IVSFilterOptions {
  include?: IVSFilterCriteria;
  exclude?: IVSFilterCriteria;
}

export interface IVSFilterCriteria {
  metadata?: Record<string, any>;
  text?: string | string[];
}
