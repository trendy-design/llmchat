"use client";
import { blobToBase64, createMediaStream } from "@/lib/record";
import { OpenAI, toFile } from "openai";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "./use-preferences";

interface UseRecordVoiceResult {
  recording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  transcribing: boolean;
  text: string;
}

export const useRecordVoice = (): UseRecordVoiceResult => {
  const [text, setText] = useState<string>("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const { getApiKey } = usePreferences();
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setIsTranscribing] = useState<boolean>(false);

  const isRecording = useRef<boolean>(false);
  const chunks = useRef<Blob[]>([]);

  const startRecording = (): void => {
    if (mediaRecorder) {
      isRecording.current = true;
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder) {
      isRecording.current = false;
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const getText = async (base64data: string): Promise<void> => {
    try {
      setIsTranscribing(true);

      const apiKey = await getApiKey("openai");

      if (!apiKey) {
        throw new Error("API key not found");
      }

      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      const audioBuffer = Buffer.from(base64data, "base64");
      const transcription = await openai.audio.transcriptions.create({
        file: await toFile(audioBuffer, "audio.wav", {
          type: "audio/wav",
        }),
        model: "whisper-1",
      });

      setIsTranscribing(false);

      setText(transcription?.text);
    } catch (error) {
      setIsTranscribing(false);

      console.log(error);
    }
  };

  const initialMediaRecorder = (stream: MediaStream): void => {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      createMediaStream(stream, true, (peak) => {});
      chunks.current = [];
    };

    mediaRecorder.ondataavailable = (ev: BlobEvent) => {
      chunks.current.push(ev.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });

      blobToBase64(audioBlob, getText);
    };

    setMediaRecorder(mediaRecorder);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder)
        .catch((error) => console.log(error));
    }
  }, []);

  return { recording, startRecording, stopRecording, text, transcribing };
};
