import { AudioWaveSpinner } from "@/components/ui/audio-wave";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { usePreferenceContext } from "@/context/preferences/provider";
import { useSettings } from "@/context/settings/context";
import { blobToBase64 } from "@/lib/record";
import { Microphone, StopCircle } from "@phosphor-icons/react";
import { OpenAI, toFile } from "openai";
import { useRef, useState } from "react";

export const useRecordVoice = () => {
  const [text, setText] = useState<string>("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const { toast } = useToast();
  const { apiKeys } = usePreferenceContext();
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setIsTranscribing] = useState<boolean>(false);
  const { preferences } = usePreferenceContext();
  const { open: openSettings } = useSettings();
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
      const apiKey = apiKeys.openai;
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

  const startVoiceRecording = async () => {
    const openAIAPIKeys = apiKeys.openai;
    if (!openAIAPIKeys) {
      toast({
        title: "API key missing",
        description:
          "Recordings require OpenAI API key. Please check settings.",
        variant: "destructive",
      });
      openSettings("openai");
      return;
    }

    if (preferences?.whisperSpeechToTextEnabled) {
      startRecording();
    } else {
      toast({
        title: "Enable Speech to Text",
        description:
          "Recordings require Speech to Text enabled. Please check settings.",
        variant: "destructive",
      });
      openSettings("voice-input");
    }
  };

  const renderRecordingControls = () => {
    if (recording) {
      return (
        <>
          <Button
            variant="ghost"
            size="iconSm"
            rounded="full"
            onClick={() => {
              stopRecording();
            }}
          >
            <StopCircle size={20} weight="fill" className="text-red-300" />
          </Button>
        </>
      );
    }

    return (
      <Tooltip content="Record">
        <Button
          size="iconSm"
          variant="ghost"
          rounded="full"
          onClick={startVoiceRecording}
        >
          <Microphone size={20} weight="bold" />
        </Button>
      </Tooltip>
    );
  };

  const renderListeningIndicator = () => {
    if (transcribing) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-4 py-1 h-10 flex flex-row items-center text-sm md:text-base">
          <AudioWaveSpinner /> <p>Transcribing ...</p>
        </div>
      );
    }
    if (recording) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-2 pr-4 py-1 h-10 flex flex-row items-center text-sm md:text-base">
          <AudioWaveSpinner />
          <p>Listening ...</p>
        </div>
      );
    }
  };

  return {
    recording,
    startRecording,
    stopRecording,
    transcribing,
    text,
    renderRecordingControls,
    renderListeningIndicator,
    startVoiceRecording,
  };
};
