import { cn } from "@/helper/clsx";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export type AudioVisualizerProps = {
  stream: MediaStream;
};

export function AudioVisualizer({ stream }: AudioVisualizerProps) {
  const [barHeights, setBarHeights] = useState<number[]>(Array(14).fill(0));
  const analyserRef = useRef<AnalyserNode>();
  const animationRef = useRef<number>();

  const visualize = useCallback((stream: MediaStream) => {
    const audioContext = new window.AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024; // Increased for better frequency resolution
    source.connect(analyser);

    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateBars = () => {
      animationRef.current = requestAnimationFrame(updateBars);

      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      const totalBars = 12;
      const minFreq = 80;
      const maxFreq = 12000;
      const frequencyRange = maxFreq - minFreq;

      // Generate random frequency ranges for each bar
      const randomRanges = Array(totalBars)
        .fill(0)
        .map(() => Math.random());
      const totalRandomness = randomRanges.reduce((sum, val) => sum + val, 0);
      const normalizedRanges = randomRanges.map((val) => val / totalRandomness);

      let accumulatedRange = 0;
      const newBarHeights = normalizedRanges.map((rangePercentage, i) => {
        const startFreq =
          minFreq * Math.pow(maxFreq / minFreq, accumulatedRange);
        accumulatedRange += rangePercentage;
        const endFreq = minFreq * Math.pow(maxFreq / minFreq, accumulatedRange);

        const startIndex = Math.floor(
          (startFreq / audioContext.sampleRate) * bufferLength,
        );
        const endIndex = Math.floor(
          (endFreq / audioContext.sampleRate) * bufferLength,
        );

        let sum = 0;
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray[j];
        }
        const average = sum / (endIndex - startIndex);

        let barHeight = average / 255;
        barHeight = Math.pow(barHeight, 1.2); // Reduced power for less aggressive scaling
        barHeight = barHeight * 1.5; // Increase overall height
        return Math.max(0.1, Math.min(1, barHeight)); // Increased minimum height
      });

      setBarHeights(newBarHeights);
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

  return (
    <div className="flex h-10 w-full items-center justify-center space-x-0.5">
      {barHeights.map((height, index) => {
        return (
          <motion.div
            key={index}
            className={cn("w-0.5 rounded-full", {
              "bg-zinc-800/30 dark:bg-white/30": height > 0,
              "bg-emerald-500/50 dark:bg-emerald-500/50": height > 0.2,
              "bg-emerald-500/90 dark:bg-emerald-500/90": height > 0.3,
            })}
            initial={{ height: 0 }}
            animate={{
              height: `${height * 100}%`,
              className: "bg-emerald-500/50",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ minHeight: "6px" }}
          ></motion.div>
        );
      })}
    </div>
  );
}
