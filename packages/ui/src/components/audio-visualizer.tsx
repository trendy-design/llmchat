'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

export type AudioVisualizerProps = {
  stream?: MediaStream | null;
};

export function AudioVisualizer({ stream }: AudioVisualizerProps) {
  const barsRef = useRef<HTMLDivElement[]>([]);
  const analyserRef = useRef<AnalyserNode>();
  const animationRef = useRef<number>();

  const visualize = useCallback((stream: MediaStream) => {
    const audioContext = new window.AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);

    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const totalBars = 6;
    const minFreq = 60;
    const maxFreq = 10000;

    const frequencyRanges = Array(totalBars)
      .fill(0)
      .map((_, i) => {
        const startFreq = minFreq * Math.pow(maxFreq / minFreq, i / totalBars);
        const endFreq = minFreq * Math.pow(maxFreq / minFreq, (i + 1) / totalBars);
        return { startFreq, endFreq };
      });

    const updateBars = () => {
      animationRef.current = requestAnimationFrame(updateBars);

      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      frequencyRanges.forEach(({ startFreq, endFreq }, i) => {
        const startIndex = Math.floor((startFreq / audioContext.sampleRate) * bufferLength);
        const endIndex = Math.floor((endFreq / audioContext.sampleRate) * bufferLength);

        let sum = 0;
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray[j];
        }
        const average = sum / (endIndex - startIndex);

        let barHeight = average / 255;
        barHeight = Math.pow(barHeight, 1.5);
        barHeight = barHeight * 3;
        barHeight = Math.max(0.05, Math.min(1, barHeight));

        if (barsRef.current[i]) {
          barsRef.current[i].style.height = `${barHeight * 100}%`;
        }
      });
    };

    updateBars();
  }, []);

  useEffect(() => {
    if (stream) {
      visualize(stream);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visualize, stream]);

  if (!stream) return null;

  return (
    <div className="flex h-24 w-full items-center justify-center space-x-1">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) barsRef.current[index] = el;
            }}
            className={cn(
              'min-h-10 w-8 rounded-full bg-zinc-800/30 transition-all duration-75 dark:bg-white/50'
            )}
            style={{ height: '32px' }}
          ></div>
        ))}
    </div>
  );
}
