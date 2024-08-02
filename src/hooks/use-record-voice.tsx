import { AudioVisualizer } from "@/components/audio-visualizer";
import { Flex, Type } from "@/components/ui";
import { AudioWaveSpinner } from "@/components/ui/audio-wave";
import { Button } from "@/components/ui/button";
import { RecordIcon, StopIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { usePreferenceContext } from "@/context";
import { blobToBase64 } from "@/helper/record";
import { useRouter } from "next/navigation";
import { OpenAI, toFile } from "openai";
import { useRef, useState } from "react";

export const useRecordVoice = () => {
  const { push } = useRouter();
  const [text, setText] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const { toast } = useToast();
  const { apiKeys } = usePreferenceContext();
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setIsTranscribing] = useState<boolean>(false);
  const { preferences } = usePreferenceContext();
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
      setStream(stream);
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

      push(`/settings/llms/openai`);
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
      push(`/settings/voice`);
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
              stopRecording();
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

  const renderListeningIndicator = () => {
    if (transcribing) {
      return (
        <Flex items="center" gap="sm" className="opacity-50">
          <AudioWaveSpinner /> <p>Transcribing ...</p>
        </Flex>
      );
    }
    if (recording && stream) {
      return (
        <Flex items="center" gap="sm">
          <AudioVisualizer stream={stream} />
          <Type size="sm" textColor="secondary" className="flex-shrink-0">
            Listening ...
          </Type>
        </Flex>
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
