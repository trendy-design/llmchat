
import Image from "next/image";
const isValidUrl = (url: string) => {
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
      

export const SourcesStack = ({urls}: {urls: string[]}) => {


        if(urls.length === 0) {
            return null;
        }
  return <div className="flex flex-row gap-2 items-center bg-white border rounded-full p-1 text-xs"><div className="flex flex-row -gap-2">{urls.slice(0, 3).map((url) => {
    const host = getHost(url);
    const favIcon = getFavIcon(host ?? "");
    if (isValidUrl(url)) {
      return <div className="relative w-6 h-6 bg-white -mr-2 border border-black/20 rounded-full overflow-hidden"> <Image src={favIcon ?? ""} alt={host ?? ""} fill className="absolute w-full h-full not-prose inset-0 object-cover"/>
      </div>;
    }
    return null;
  })}</div>  <div className="text-xs text-zinc-500 px-1">{urls.length} sources</div></div>;
};
