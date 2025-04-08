export const sanitizeMDX = (buffer: string) => {
  // Remove incomplete tag at the end
  const incompleteTagMatch = buffer.match(/<[^>]*$/);
  if (incompleteTagMatch) {
    buffer = buffer.slice(0, incompleteTagMatch.index);
  }

  // Add newlines between adjacent tags to prevent MDX parsing issues
  buffer = buffer.replace(/><(thought|answer|Think|Source)/g, '>\n<$1');
  buffer = buffer.replace(/<\/(thought|answer|Think|Source)></g, '</thought>\n<');

  // Handle unclosed tags
  const openedTagPattern = /<(thought|answer|Think|Source)(\s+[^>]*)?>/g;
  const closedTagPattern = /<\/(thought|answer|Think|Source)\s*>/g;

  const openTagsStack: string[] = [];
  // Find all opening tags and their positions
  let match;
  while ((match = openedTagPattern.exec(buffer)) !== null) {
    openTagsStack.push(match[1]);
  }
  // Find all closing tags
  while ((match = closedTagPattern.exec(buffer)) !== null) {
    const tagName = match[1];
    const lastIndex = openTagsStack.lastIndexOf(tagName);
    if (lastIndex !== -1) {
      openTagsStack.splice(lastIndex, 1);
    }
  }

  // Close unclosed tags in reverse order
  while (openTagsStack.length > 0) {
    const lastTag = openTagsStack.pop();
    buffer += `\n\n</${lastTag}>`;
  }

  return buffer;
};
