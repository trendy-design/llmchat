import { Flex } from "@/components/ui";
import { AudioWaveSpinner } from "@/components/ui/audio-wave";
import { Button } from "@/components/ui/button";
import { RecordIcon, StopIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { usePreferenceContext } from "@/context";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const WHISPER_SAMPLING_RATE = 16_000;
const MAX_AUDIO_LENGTH = 60; // seconds
const MAX_SAMPLES = WHISPER_SAMPLING_RATE * MAX_AUDIO_LENGTH;

export const useWhisperRecorder = () => {
  const { push } = useRouter();
  const [text, setText] = useState<string>("");
  const [partialText, setPartialText] = useState<string>("");
  const { toast } = useToast();
  const { apiKeys } = usePreferenceContext();
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setIsTranscribing] = useState<boolean>(false);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const { preferences } = usePreferenceContext();
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const runLocalWhisper = async (audioData: AudioBuffer) => {
    let audio;
    if (audioData.numberOfChannels === 2) {
      const SCALING_FACTOR = Math.sqrt(2);

      let left = audioData.getChannelData(0);
      let right = audioData.getChannelData(1);

      audio = new Float32Array(left.length);
      for (let i = 0; i < audioData.length; ++i) {
        audio[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2;
      }
    } else {
      // If the audio is not stereo, we can just use the first channel:
      audio = audioData.getChannelData(0);
    }

    const worker = new Worker(
      new URL("../worker/transformer-worker.js", import.meta.url),
    );

    worker.postMessage({
      audio: audio,
      model: "Xenova/whisper-base",
      multilingual: false,
      quantized: false,
      subtask: null,
      language: "english",
    });

    worker.onmessage = (event) => {
      const data = event.data;
      // if (data?.data?.text && data?.status === "complete") {
      //   setText(data.data.text);
      // }
      if (data?.data?.text && data?.status === "update") {
        console.log(data);

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
        setText("");
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
        const decoded = await audioContextRef.current?.decodeAudioData(
          arrayBuffer as ArrayBuffer,
        );
        let audio = decoded?.getChannelData(0);
        if (audio?.length || 0 > MAX_SAMPLES) {
          // Get last MAX_SAMPLES
          audio = audio?.slice(-MAX_SAMPLES);
        }

        workerRef.current?.postMessage({
          type: "generate",
          data: { audio, language: "en" },
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
            <StopIcon
              size={18}
              variant="solid"
              strokeWidth="2"
              className="text-rose-400/80"
            />
            <span className="hidden group-hover:flex">Stop</span>
          </Button>
        </>
      );
    }

    return (
      <Tooltip content="Record">
        <Button size="icon" variant="ghost" onClick={startVoiceRecording}>
          <RecordIcon size={18} variant="stroke" strokeWidth="2" />
        </Button>
      </Tooltip>
    );
  };

  useEffect(() => {
    if (workerRef.current) return;
    workerRef.current = new Worker(
      new URL("../worker/transformer-worker.js", import.meta.url),
    );

    workerRef.current.addEventListener("message", (event) => {
      console.log(event.data);
      if (event?.data?.status === "start") {
        setIsProcessing(true);
        recorderRef.current?.requestData();
      }
      if (event?.data?.status === "complete") {
        setIsProcessing(false);
        setPartialText(event.data.output);
      }
    });

    return () => {
      workerRef.current?.removeEventListener("message", (event) => {
        console.log(event.data);
      });
    };
  }, []);

  const renderListeningIndicator = () => {
    if (transcribing) {
      return (
        <Flex items="center" gap="sm" className="opacity-50">
          <AudioWaveSpinner /> <p>Transcribing ...</p>
        </Flex>
      );
    }
    if (recording) {
      return (
        <Flex items="center" gap="sm" className="opacity-50">
          <AudioWaveSpinner />
          <p>Listening ...</p>
        </Flex>
      );
    }
  };

  const renderDownloadButton = () => {
    return (
      <Button
        onClick={() => {
          if (workerRef.current) {
            workerRef.current.postMessage({
              type: "load",
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
