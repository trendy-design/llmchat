import { animate, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

let delimiter = ' ';
export function useAnimatedText(text: string, shouldAnimate = true) {
    let animatedCursor = useMotionValue(0);
    let [cursor, setCursor] = useState(0);
    let [prevText, setPrevText] = useState(text);
    let [isSameText, setIsSameText] = useState(true);

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

        let controls = animate(animatedCursor, text.split(delimiter).length, {
            duration: 3,
            ease: 'easeOut',
            onUpdate(latest) {
                setCursor(Math.floor(latest));
            },
        });

        return () => controls.stop();
    }, [animatedCursor, isSameText, text]);

    if (!shouldAnimate) {
        return text;
    }

    return text.split(delimiter).slice(0, cursor).join(delimiter);
}
