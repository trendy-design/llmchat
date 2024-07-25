import { IVSDocument } from '../types/IVSDocument';
import { IVSFilterCriteria, IVSFilterOptions } from '../types/IVSFilterOptions';

export function filterDocuments(documents: Array<IVSDocument<any>>, filterOptions?: IVSFilterOptions): Array<IVSDocument<any>> {
  let filteredDocuments = documents;
  if (filterOptions) {
    if (filterOptions.include) {
      filteredDocuments = filteredDocuments.filter((doc) => matchesCriteria(doc, filterOptions.include!));
    }
    if (filterOptions.exclude) {
      filteredDocuments = filteredDocuments.filter((doc) => !matchesCriteria(doc, filterOptions.exclude!));
    }
  }
  return filteredDocuments;
}

function matchesCriteria(document: IVSDocument<any>, criteria: IVSFilterCriteria): boolean {
  if (criteria.metadata) {
    for (const key in criteria.metadata) {
      if (document.metadata[key] !== criteria.metadata[key]) {
        return false;
      }
    }
  }
  if (criteria.text) {
    const texts = Array.isArray(criteria.text) ? criteria.text : [criteria.text];
    if (!texts.includes(document.text)) {
      return false;
    }
  }
  return true;
}

export function getObjectSizeInMB(obj: object): number {
  const bytes = JSON.stringify(obj).length;
  const kilobytes = bytes / 1024;
  return kilobytes / 1024;
}

export function debounce(func: (...args: any[]) => void, delay: number): (...args: any[]) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: any[]) {
    const context = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => func.apply(context, args), delay);
  };
}
