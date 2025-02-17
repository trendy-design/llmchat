import { encodingForModel } from 'js-tiktoken';

export const useTokenCounter = () => {
  const getTokenCount = (message: string) => {
    const enc = encodingForModel('gpt-4o');
    if (message) {
      return enc.encode(message).length;
    }
    return undefined;
  };

  return {
    getTokenCount,
  };
};
