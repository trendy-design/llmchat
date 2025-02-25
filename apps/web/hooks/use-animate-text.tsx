import { animate, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

export function useAnimatedText(text: string, delimiter = ' ', shouldAnimate = true) {
  const animatedCursor = useMotionValue(0);
  const [cursor, setCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);
  const [isSameText, setIsSameText] = useState(true);
  const [isDone, setIsDone] = useState(false);

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

    const controls = animate(animatedCursor, (text ?? '').split(delimiter).length, {
      duration: 2,
      ease: 'easeOut',
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
      onComplete() {
        setIsDone(true);
      },
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animatedCursor, isSameText, text, shouldAnimate]);

  return {
    text: shouldAnimate ? (text ?? '').split(delimiter).slice(0, cursor).join(delimiter) : text,
    isDone,
  };
}
