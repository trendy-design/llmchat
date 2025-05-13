import { platform } from '@todesktop/client-core';
import * as React from 'react';

export function useMediaQuery(query: string) {
    const [value, setValue] = React.useState(false);

    React.useEffect(() => {
        function onChange(event: MediaQueryListEvent) {
            setValue(event.matches);
        }

        const result = matchMedia(query);
        result.addEventListener('change', onChange);
        setValue(result.matches);

        return () => result.removeEventListener('change', onChange);
    }, [query]);

    return value;
}

export function useIsMobile() {
    return useMediaQuery('(max-width: 768px)');
}

export function useIsWeb() {
    return useMediaQuery('(min-width: 768px)');
}

export function useIsToDesktop() {
    return platform.todesktop.isDesktopApp;
}
