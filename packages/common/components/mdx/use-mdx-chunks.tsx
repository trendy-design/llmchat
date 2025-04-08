import { createProcessor } from '@mdx-js/mdx';

//
// Types
//
export type MdxChunk = string;

/**
 * A hook that splits MDX text into top-level chunks that can be memoized.
 */
export const useMdxChunker = () => {
    /**
     * Extract the substring from the original MDX text for the given node's range.
     */
    const getNodeText = (node: any, lines: string[]): string => {
        if (!node.position || !node.position.start || !node.position.end) {
            return '';
        }
        const startLine = node.position.start.line;
        const endLine = node.position.end.line;
        // `slice` is zero-based, node positions are 1-based.
        return lines
            .slice(startLine - 1, endLine)
            .join('\n')
            .trim();
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

    const getListContext = (node: any): { type: string | null; items: any[] } => {
        if (node.type === 'list') {
            return {
                type: node.ordered ? 'ol' : 'ul',
                items: node.children || [],
            };
        }
        return { type: null, items: [] };
    };

    /**
     * Recursively build a chunk from a node in the AST.
     * - Block nodes => produce a top-level chunk (string or object).
     * - If the block node is a JSX element, we gather inline children.
     * - Inline nodes => produce text chunks (used for children inside JSX, etc.).
     *
     * Return `null` if the node type is something we don't want to chunk.
     */
    const processNode = (node: any, lines: string[]): string | null => {
        const nodeText = getNodeText(node, lines);
        if (!nodeText) return null;

        // Handle list structures
        if (node.type === 'list') {
            const listType = node.ordered ? 'ol' : 'ul';
            return nodeText;
        }

        // Handle list items but maintain parent list context
        if (node.type === 'listItem' && node.parent) {
            const parentList = node.parent;
            const listType = parentList.ordered ? 'ol' : 'ul';

            // If this is the first list item, include the opening tag
            const isFirstItem = parentList.children[0] === node;
            const isLastItem = parentList.children[parentList.children.length - 1] === node;

            if (isFirstItem && isLastItem) {
                // Single item list needs both opening and closing tags
                return `<${listType}>\n${nodeText}\n</${listType}>`;
            } else if (isFirstItem) {
                // First item needs opening tag
                return `<${listType}>\n${nodeText}`;
            } else if (isLastItem) {
                // Last item needs closing tag
                return `${nodeText}\n</${listType}>`;
            }
        }

        // Special handling for code blocks to ensure they're properly contained
        if (node.type === 'code') {
            return nodeText;
        }

        // Handle JSX elements
        if (node.type === 'mdxJsxFlowElement') {
            const tagName = node.name;
            if (!isTagComplete(tagName, nodeText)) {
                return `${nodeText}</${tagName}>`;
            }
        }

        return nodeText;
    };

    const shouldCombineWithPrevious = (currentNode: any, previousNode: any): boolean => {
        // If the current node is a list item and previous node is from the same list
        if (currentNode.type === 'listItem' && previousNode?.type === 'listItem') {
            return currentNode.parent === previousNode.parent;
        }

        // Don't combine different block elements
        return false;
    };

    /**
     * Main function to parse MDX text and build an array of MdxChunks.
     */
    const chunkMdx = async (mdxText: string) => {
        try {
            const processor = createProcessor({ jsx: true });
            const ast = await processor.parse(mdxText);

            const lines = mdxText.split('\n');
            const chunks: string[] = [];
            let currentChunk: string | null = null;
            let previousNode: any = null;

            if (Array.isArray(ast.children)) {
                for (const node of ast.children) {
                    const processedText = processNode(node, lines);

                    if (processedText) {
                        // Check if we should combine with the previous chunk based on content relationship
                        if (previousNode && shouldCombineWithPrevious(node, previousNode)) {
                            if (chunks.length > 0) {
                                chunks[chunks.length - 1] += '\n' + processedText;
                            } else {
                                chunks.push(processedText);
                            }
                        } else {
                            chunks.push(processedText);
                        }

                        previousNode = node;
                    }
                }
            }

            return { chunks };
        } catch (error) {
            console.error('Failed to parse and chunk MDX:', error);
            return { chunks: [] };
        }
    };

    return {
        chunkMdx,
    };
};
