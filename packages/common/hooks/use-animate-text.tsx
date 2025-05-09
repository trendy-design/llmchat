import { animate, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

let delimiter = '';

export function useAnimatedText(text: string, shouldAnimate: boolean) {
    const animatedCursor = useMotionValue(0);
    const [cursor, setCursor] = useState(0);
    const [prevText, setPrevText] = useState(text);
    const [isSameText, setIsSameText] = useState(true);

    if (prevText !== text) {
        setPrevText(text);
        setIsSameText(text.startsWith(prevText));
        if (!text.startsWith(prevText)) {
            setCursor(0);
        }
    }

    useEffect(() => {
        if (!shouldAnimate) {
            return;
        }

        if (!isSameText) {
            animatedCursor.jump(0);
        }

        const controls = animate(animatedCursor, text.length, {
            duration: 3,
            ease: 'easeOut',
            onUpdate(latest) {
                setCursor(Math.floor(latest));
            },
        });

        return () => controls.stop();
    }, [animatedCursor, isSameText, text]);

    return shouldAnimate ? text.split(delimiter).slice(0, cursor).join(delimiter) : text;
}
