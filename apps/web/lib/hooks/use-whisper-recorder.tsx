import { Button, Tooltip, useToast } from '@repo/ui';
import { Circle, CircleStop } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const WHISPER_SAMPLING_RATE = 16_000;
const MAX_AUDIO_LENGTH = 60; // seconds
const MAX_SAMPLES = WHISPER_SAMPLING_RATE * MAX_AUDIO_LENGTH;

// WIP: Experimenting with local whisper
export const useWhisperRecorder = () => {
  const { push } = useRouter();
  const [text, setText] = useState<string>('');
  const [partialText, setPartialText] = useState<string>('');
  const { toast } = useToast();
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setIsTranscribing] = useState<boolean>(false);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const runLocalWhisper = async (audioData: AudioBuffer) => {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let audio;
    if (audioData.numberOfChannels === 2) {
      const SCALING_FACTOR = Math.sqrt(2);

      const left = audioData.getChannelData(0);
      const right = audioData.getChannelData(1);

      audio = new Float32Array(left.length);
      for (let i = 0; i < audioData.length; ++i) {
        audio[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2;
      }
    } else {
      // If the audio is not stereo, we can just use the first channel:
      audio = audioData.getChannelData(0);
    }

    const worker = new Worker(new URL('../worker/transformer-worker.js', import.meta.url));

    worker.postMessage({
      audio: audio,
      model: 'Xenova/whisper-base',
      multilingual: false,
      quantized: false,
      subtask: null,
      language: 'english',
    });

    worker.onmessage = (event) => {
      const data = event.data;
      // if (data?.data?.text && data?.status === "complete") {
      //   setText(data.data.text);
      // }
      if (data?.data?.text && data?.status === 'update') {
        setPartialText(data?.data?.[0]?.trim());
      }
    };
  };
  const setAudioFromRecording = async (data: Blob) => {
    const blobUrl = URL.createObjectURL(data);
    const fileReader = new FileReader();
    fileReader.onprogress = (event) => {};
    fileReader.onloadend = async () => {
      const audioCTX = new AudioContext({
        sampleRate: 16000,
      });
      const arrayBuffer = fileReader.result as ArrayBuffer;
      const decoded = await audioCTX.decodeAudioData(arrayBuffer);
      runLocalWhisper(decoded);
    };
    fileReader.readAsArrayBuffer(data);
  };

  useEffect(() => {
    if (recorderRef.current) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      recorderRef.current = new MediaRecorder(stream);
      audioContextRef.current = new AudioContext({
        sampleRate: WHISPER_SAMPLING_RATE,
      });

      recorderRef.current.onstart = () => {
        setRecording(true);
        setText('');
        setChunks([]);
      };
      recorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setChunks((prev) => [...prev, e.data]);
        } else {
          // Empty chunk received, so we request new data after a short timeout
          setTimeout(() => {
            recorderRef.current?.requestData();
          }, 25);
        }
      };

      recorderRef.current.onstop = () => {
        setRecording(false);
      };
    });
  }, []);

  useEffect(() => {
    if (!recorderRef.current) return;
    if (!recording) return;
    if (isProcessing) return;

    if (chunks.length > 0) {
      // Generate from data
      const blob = new Blob(chunks, { type: recorderRef.current.mimeType });

      const fileReader = new FileReader();

      fileReader.onloadend = async () => {
        const arrayBuffer = fileReader.result;
        const decoded = await audioContextRef.current?.decodeAudioData(arrayBuffer as ArrayBuffer);
        let audio = decoded?.getChannelData(0);
        if (audio?.length || 0 > MAX_SAMPLES) {
          // Get last MAX_SAMPLES
          audio = audio?.slice(-MAX_SAMPLES);
        }

        workerRef.current?.postMessage({
          type: 'generate',
          data: { audio, language: 'en' },
        });
      };
      fileReader.readAsArrayBuffer(blob);
    } else {
      recorderRef.current?.requestData();
    }
  }, [recording, chunks, isProcessing]);

  //   const stopRecording = (): void => {
  //     if (recorderRef) {
  //       recorderRef.current?.stop();
  //       setRecording(false);
  //     }
  //   };

  const startVoiceRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.start();
    }
  };

  const renderRecordingControls = () => {
    if (recording) {
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              //       stopRecording();
            }}
            className="group"
          >
            <CircleStop size={16} strokeWidth={2} className="text-rose-400/80" />
            <span className="hidden group-hover:flex">Stop</span>
          </Button>
        </>
      );
    }

    return (
      <Tooltip content="Record">
        <Button size="icon" variant="ghost" onClick={startVoiceRecording}>
          <Circle size={16} strokeWidth="2" />
        </Button>
      </Tooltip>
    );
  };

  useEffect(() => {
    if (workerRef.current) return;
    workerRef.current = new Worker(new URL('../worker/transformer-worker.js', import.meta.url));

    workerRef.current.addEventListener('message', (event) => {
      if (event?.data?.status === 'start') {
        setIsProcessing(true);
        recorderRef.current?.requestData();
      }
      if (event?.data?.status === 'complete') {
        setIsProcessing(false);
        setPartialText(event.data.output);
      }
    });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const renderListeningIndicator = () => {};

  const renderDownloadButton = () => {
    return (
      <Button
        onClick={() => {
          if (workerRef.current) {
            workerRef.current.postMessage({
              type: 'load',
            });
          }
        }}
      >
        Download
      </Button>
    );
  };

  return {
    recording,
    startRecording: startVoiceRecording,
    stopRecording: () => {},
    transcribing,
    text,
    partialText,
    renderRecordingControls,
    renderListeningIndicator,
    renderDownloadButton,
    startVoiceRecording,
  };
};
