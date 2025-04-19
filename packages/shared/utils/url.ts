export const getHostname = (url: string) => {
    try {
        const hostname = new URL(url).hostname.split('.')[0];
        if (hostname === 'www') {
            return new URL(url).hostname.substring(4);
        }
        return hostname;
    } catch (error) {
        return url;
    }
};

export const getHost = (url: string) => {
    try {
        const hostname = new URL(url).hostname;
        return hostname;
    } catch (error) {
        return undefined;
    }
};
