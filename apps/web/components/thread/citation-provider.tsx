import { Block, useChatStore } from '@/libs/store/chat.store';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';

export type Citation = {
  url: string;
  host: string;
  favIcon: string;
  index: number;
  isExtra?: boolean;
  extraCount?: number;
};

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const getHost = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return null;
  }
};

const getFavIcon = (host?: string) => {
  if (!host) {
    return null;
  }
  try {
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch (error) {
    return null;
  }
};

export type CitationProviderContextType = {
  citations: Record<string, Citation>;
};

export const CitationProviderContext = createContext<CitationProviderContextType>({
  citations: {},
});

export const CitationProvider = ({ block, children }: PropsWithChildren<{ block: Block }>) => {
  const [citations, setCitations] = useState<Record<string, Citation>>({});
  const setCurrentSources = useChatStore(state => state.setCurrentSources);

  useEffect(() => {
    const allCitations = block.sources || [];
    const uniqueCitations = Array.from(new Set(allCitations)).filter(Boolean);
    const MAX_VISIBLE_CITATIONS = 4;


    setCitations(
      uniqueCitations.reduce((citations, url, index) => {
        const isValid = isValidUrl(url);
        const favIcon = getFavIcon(url);
        const host = getHost(url);
        if (!isValid) return citations;

        if (index < MAX_VISIBLE_CITATIONS) {
          return {
            ...citations,
            [url]: {
              index: index + 1,
              url,
              host,
              favIcon,
            },
          };
        }

        if (index === MAX_VISIBLE_CITATIONS) {
          return {
            ...citations,
            [url]: {
              index: index + 1,
              url,
              host,
              favIcon,
              isExtra: true,
              extraCount: uniqueCitations.length - MAX_VISIBLE_CITATIONS,
            },
          };
        }

        return citations;
      }, {})
    );
  }, [block]);

  useEffect(() => {
    setCurrentSources(Object.keys(citations));
  }, [citations]);

  return (
    <CitationProviderContext.Provider value={{ citations }}>
      {children}
    </CitationProviderContext.Provider>
  );
};
