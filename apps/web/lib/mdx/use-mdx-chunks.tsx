import { createProcessor } from '@mdx-js/mdx';
import { useState } from 'react';

//
// Types
//
export type MdxChunk =
  | {
      mdx: string;               // Raw text for this node (start -> end lines)
      mdxTag: string;            // e.g., 'MyComponent', 'Source', 'img', etc.
      mdxProps: Record<string, any>;
      children: MdxChunk[];      // Nested chunks (usually inline or sub-items)
    }
  | string;                      // For simple blocks like paragraphs, headings, code, etc.

//
// If you specifically want to track <Source> data, define a more precise type
// for how you store them in state:
//
type SourceInfo = {
  mdxTag: string;
  mdxProps: Record<string, any>;
  content: string;              // Possibly the chunk text or relevant URL, etc.
};

/**
 * A hook that splits MDX text into top-level chunks that can be memoized.
 * Also collects <Source ...> data into `sources`.
 */
export const useMdxChunker = () => {
  const [sources, setSources] = useState<SourceInfo[]>([]);

  /**
   * We consider these MDX AST node types as "block" elements:
   * - `import`, `export`, `mdxjsEsm` => (MDX's internal representation for import/export statements)
   * - `mdxJsxFlowElement` => e.g., <MyComponent> as a block element
   * - `heading`, `paragraph`, `blockquote`, `list`, `listItem`, `code`, `thematicBreak`, `table`, etc.
   * You can add or remove items depending on your needs.
   */
  const blockNodeTypes = new Set([
    'import',
    'export',
    'mdxjsEsm',
    'mdxJsxFlowElement',
    'heading',
    'paragraph',
    'blockquote',
    'list',
    'listItem',
    'code',
    'thematicBreak',
    'table',
    'tableRow',
    'tableCell',
  ]);

  /**
   * We consider these node types as "inline" elements to be collected
   * within a parent block. Typically text, inline code, or inline JSX.
   */
  const inlineNodeTypes = new Set([
    'text',
    'inlineCode',
    'mdxJsxTextElement',
  ]);

  /**
   * Extract the substring from the original MDX text for the given node's range.
   */
  const getNodeText = (
    node: any,
    lines: string[]
  ): string => {
    if (!node.position || !node.position.start || !node.position.end) {
      return '';
    }
    const startLine = node.position.start.line;
    const endLine = node.position.end.line;
    // `slice` is zero-based, node positions are 1-based.
    return lines.slice(startLine - 1, endLine).join('\n').trim();
  };

  /**
   * Extract the props/attributes from an mdxJsxFlowElement or mdxJsxTextElement node.
   */
  const getMdxProps = (node: any): Record<string, any> => {
    if (!node.attributes) return {};
    return node.attributes.reduce((acc: Record<string, any>, attr: any) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };

  /**
   * Heuristic to check if a JSX tag is "complete" (opening + closing) by name.
   */
  const isTagComplete = (tagName: string, text: string) => {
    // Looks for something like `</TagName>`
    const closingRegex = new RegExp(`<\\s*/\\s*${tagName}\\s*>`, 'i');
    return closingRegex.test(text);
  };

  /**
   * Recursively build a chunk from a node in the AST.
   * - Block nodes => produce a top-level chunk (string or object).
   * - If the block node is a JSX element, we gather inline children.
   * - Inline nodes => produce text chunks (used for children inside JSX, etc.).
   *
   * Return `null` if the node type is something we don't want to chunk.
   */
  const buildChunk = (
    node: any,
    lines: string[]
  ): MdxChunk | null => {
    // If it's a recognized block node:
    if (blockNodeTypes.has(node.type)) {
      const nodeText = getNodeText(node, lines);
      if (!nodeText) return null;

      // For `mdxJsxFlowElement`, we want an object chunk capturing tag, props, children, etc.
      if (node.type === 'mdxJsxFlowElement') {
        const mdxProps = getMdxProps(node);
        const tagName = (node.name || '').trim();

        // Gather *inline* children
        const childChunks: MdxChunk[] = [];
        if (Array.isArray(node.children)) {
          node.children.forEach((child: any) => {
            if (inlineNodeTypes.has(child.type)) {
              const inlineChunkText = getNodeText(child, lines);
              if (inlineChunkText) {
                childChunks.push(inlineChunkText);
              }
            }
            // Note: If you want to allow block children inside a JSX element
            // (like nested paragraphs, headings, etc.), you could call
            // `buildChunk(child, lines)` here.  But that can lead to
            // overlapping lines. Typically, you'll treat the entire
            // <Component>...</Component> as a single chunk and only
            // gather truly inline children.
          });
        }

        // Check if the tag is "complete" (opening + closing tag)
        let complete = false;
        // Attempt to find the actual tag name from the text (fallback to `tagName`).
        // <MyComponent> => group 1 = MyComponent
        const maybeTagName = nodeText.match(/<\s*([A-Za-z0-9_-]+)/)?.[1] || tagName;
        if (maybeTagName) {
          complete = isTagComplete(maybeTagName, nodeText);
        }

        const objectChunk: MdxChunk = {
          mdx: nodeText,
          mdxTag: tagName,
          mdxProps: {
            ...mdxProps,
            isTagComplete: complete,
          },
          children: childChunks,
        };

        // If this is specifically a <Source> element, we store it in sources:
        if (tagName.toLowerCase() === 'source') {
          setSources((prev) => [
            ...prev,
            {
              mdxTag: objectChunk.mdxTag,
              mdxProps: objectChunk.mdxProps,
              content: nodeText, // Or customize how you want to store the chunk
            },
          ]);
        }

        return objectChunk;
      }

      // Otherwise, for other block node types (heading, paragraph, code, etc.),
      // just store it as a raw string chunk
      return nodeText;
    }

    // If it's an inline node, return a simple string chunk
    if (inlineNodeTypes.has(node.type)) {
      const nodeText = getNodeText(node, lines);
      return nodeText || null;
    }

    // For anything else not in block or inline sets, return null (no chunk).
    return null;
  };

  /**
   * Main function to parse MDX text and build an array of MdxChunks.
   */
  const chunkMdx = async (mdxText: string) => {
    try {
      const processor = createProcessor({ jsx: true });
      const ast = await processor.parse(mdxText);

      const lines = mdxText.split('\n');
      const chunks: MdxChunk[] = [];

      // The top-level MDX AST often has an array of children at `ast.children`.
      // We'll iterate through them and build chunks as needed.
      if (Array.isArray(ast.children)) {
        for (const node of ast.children) {
          const chunk = buildChunk(node, lines);
          if (chunk) {
            chunks.push(chunk);
          }
        }
      }

      return { chunks, sources };
    } catch (error) {
      console.error('Failed to parse and chunk MDX:', error);
      return { chunks: [], sources: [] };
    }
  };

  return {
    chunkMdx,
    sources,
  };
};
