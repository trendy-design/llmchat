'use client';

export const isDesktop = () => {
    // ----- Node / SSR side -----
    if (typeof process !== 'undefined' && process?.versions?.electron) {
        return true;
    }

    // ----- Browser side -----
    if (typeof navigator === 'object' && navigator.userAgent?.includes('Electron')) {
        return true;
    }

    return false;
};
