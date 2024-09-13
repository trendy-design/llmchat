import { useToast } from "@/ui";
import { useRouter } from "next/navigation";
import { OpenAI, toFile } from "openai";
import { useEffect, useRef, useState } from "react";
import { usePreferenceContext } from "../context";
import { blobToBase64 } from "../utils/record";

export const useRecordVoice = () => {
  const { push } = useRouter();
  const [startTime, setStartTime] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const { toast } = useToast();
  const { getApiKey } = usePreferenceContext();
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setIsTranscribing] = useState<boolean>(false);
  const { preferences } = usePreferenceContext();
  const chunks = useRef<Blob[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const startRecording = async (): Promise<void> => {
    setText("");
    chunks.current = [];
    setElapsedTime(0); // Reset elapsed time
    setStartTime(Date.now()); // Reset start time
    if (mediaRecorder) {
      mediaRecorder.start(1000);
      setRecording(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);
      const newMediaRecorder = new MediaRecorder(stream);
      setStartTime(Date.now());
      newMediaRecorder.ondataavailable = (event) => {
        chunks.current.push(event.data);
      };
      newMediaRecorder.onstop = async () => {};
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
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      blobToBase64(audioBlob, getText);
    }
  };

  const cancelRecording = (): void => {
    if (mediaRecorder) {
      mediaRecorder.stop();

      setRecording(false);
    }
  };
  const getText = async (base64data: string): Promise<void> => {
    setIsTranscribing(true);
    try {
      const apiKey = getApiKey("openai");
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
    const openAIAPIKeys = getApiKey("openai");
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

  // const renderRecordingControls = () => {
  //   return (

  //   );
  // };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > 60000) {
          stopRecording();
        } else {
          setElapsedTime(Math.floor(elapsedTime / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording, startTime]);

  // const renderListeningIndicator = () => {
  //   if (transcribing) {
  //     return (
  //       <Flex items="center" gap="sm" className="opacity-50">
  //         <AudioWaveSpinner /> <p>Transcribing ...</p>
  //       </Flex>
  //     );
  //   }
  //   navigator.vibrate(200);

  //   if (recording && stream) {
  //     return (
  //       <Flex
  //         className="fixed bottom-0 left-0 right-0 top-0 z-50 bg-white/90 backdrop-blur-sm dark:bg-zinc-800/90"
  //         direction="col"
  //         items="center"
  //         justify="center"
  //       >
  //         <Flex
  //           items="center"
  //           direction="col"
  //           gap="sm"
  //           justify="between"
  //           className="h-screen"
  //         >
  //           <Flex direction="row" gap="sm" items="center" className="p-6">
  //             <Flex
  //               gap="xs"
  //               items="center"
  //               className="rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-700"
  //             >
  //               <Type size="base" weight="medium" className="flex-shrink-0">
  //                 {formatTime(elapsedTime)}
  //               </Type>
  //               <Type
  //                 textColor="tertiary"
  //                 size="base"
  //                 weight="medium"
  //                 className="flex-shrink-0"
  //               >
  //                 / 1:00
  //               </Type>
  //             </Flex>
  //           </Flex>

  //           <AudioVisualizer stream={stream} />

  //           <Flex gap="sm" className="w-full p-6" justify="center">
  //             <Button
  //               variant="secondary"
  //               rounded="full"
  //               size="lg"
  //               onClick={() => {
  //                 cancelRecording();
  //               }}
  //               className="group"
  //             >
  //               <Cancel01Icon size={16} strokeWidth="2" />
  //               Cancel
  //             </Button>
  //             <Button
  //               rounded="full"
  //               size="lg"
  //               onClick={() => {
  //                 stopRecording();
  //               }}
  //               className="group"
  //             >
  //               <Tick01Icon size={16} strokeWidth="2" />
  //               Done
  //             </Button>
  //           </Flex>
  //         </Flex>
  //       </Flex>
  //     );
  //   }
  // };

  return {
    recording,
    startRecording,
    stopRecording,
    transcribing,
    text,
    stream,
    elapsedTime,
    cancelRecording,
    startVoiceRecording,
  };
};
