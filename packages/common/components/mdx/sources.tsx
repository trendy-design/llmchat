import { XMLParser } from 'fast-xml-parser';

export function parseSourceTagsFromXML(xmlText: string): string[] {
  if (!xmlText) {
    return [];
  }

  try {
    const parser = new XMLParser();
    const parsed = parser.parse(xmlText);
    const results: Set<string> = new Set();

    const traverseObject = (obj: any): void => {
      if (obj && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          if (key === 'Source') {
            if (Array.isArray(value)) {
              value.forEach(val => {
                results.add(val);
              });
            } else {
              results.add(value as string);
            }
          } else {
            traverseObject(value);
          }
        }
      }
    };
    // 5. Start traversal from the top-level parsed object.
    traverseObject(parsed);

    return Array.from(results);
  } catch (error) {
    console.error(error);
    return [];
  }
}
