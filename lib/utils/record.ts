const blobToBase64 = (
  blob: Blob,
  callback: (base64data: string) => void
): void => {
  const reader = new FileReader();
  reader.onload = function () {
    const base64data = reader.result?.toString().split(",")[1] || null;
    base64data && callback(base64data);
  };
  reader.readAsDataURL(blob);
};

const getPeakLevel = (analyzer: AnalyserNode): number => {
  const array = new Uint8Array(analyzer.fftSize);
  analyzer.getByteTimeDomainData(array);
  return (
    array.reduce((max, current) => Math.max(max, Math.abs(current - 127)), 0) /
    128
  );
};

const createMediaStream = (
  stream: MediaStream,
  isRecording: boolean,
  callback: (peak: number) => void
): void => {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const analyzer = context.createAnalyser();
  source.connect(analyzer);

  const tick = () => {
    const peak = getPeakLevel(analyzer);
    if (isRecording) {
      callback(peak);
      requestAnimationFrame(tick);
    }
  };

  tick();
};

export { blobToBase64, createMediaStream };
