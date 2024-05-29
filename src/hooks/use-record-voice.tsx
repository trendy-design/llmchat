import { useToast } from "@/components/ui/use-toast";
import { blobToBase64 } from "@/lib/record";
import { OpenAI, toFile } from "openai";
import { useRef, useState } from "react";
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
  const { toast } = useToast();
  const { getApiKey } = usePreferences();
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setIsTranscribing] = useState<boolean>(false);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async (): Promise<void> => {
    setText("");
    chunks.current = [];
    if (mediaRecorder) {
      mediaRecorder.start(1000);
      setRecording(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newMediaRecorder = new MediaRecorder(stream);
      newMediaRecorder.ondataavailable = (event) => {
        chunks.current.push(event.data);
      };
      newMediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
        blobToBase64(audioBlob, getText);
      };
      setMediaRecorder(newMediaRecorder);
      newMediaRecorder.start(1000);
      setRecording(true);
    } catch (error) {
      console.error("Error accessing the microphone: ", error);
      toast({
        title: "Error",
        description: "Failed to access the microphone.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const getText = async (base64data: string): Promise<void> => {
    setIsTranscribing(true);
    try {
      const apiKey = await getApiKey("openai");
      if (!apiKey) throw new Error("API key not found");
      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      const audioBuffer = Buffer.from(base64data, "base64");
      const transcription = await openai.audio.transcriptions.create({
        file: await toFile(audioBuffer, "audio.wav", { type: "audio/wav" }),
        model: "whisper-1",
      });
      setText(transcription?.text || "");
    } catch (error) {
      console.error("Error transcribing audio: ", error);
      toast({
        title: "Transcription Error",
        description: "Failed to transcribe the audio.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return { recording, startRecording, stopRecording, transcribing, text };
};
