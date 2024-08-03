import { AudioVisualizer } from "@/components/ui/audio-visualizer";
import { useChatContext } from "@/context";
import { formatTickerTime } from "@/helper/utils";
import { useRecordVoice } from "@/hooks";
import { Cancel01Icon, RecordIcon, Tick01Icon } from "@hugeicons/react";
import { FC, useEffect } from "react";
import { Button, Flex, LinearSpinner, Tooltip, Type } from "../ui";

export type TAudioRecorder = {
  sendMessage: (message: string) => void;
};

export const AudioRecorder: FC<TAudioRecorder> = ({ sendMessage }) => {
  const { store } = useChatContext();
  const session = store((state) => state.session);
  const editor = store((state) => state.editor);

  const {
    stream,
    elapsedTime,
    stopRecording,
    recording,
    transcribing,
    text,
    cancelRecording,
    startVoiceRecording,
  } = useRecordVoice();

  useEffect(() => {
    if (text && session) {
      editor?.commands.clearContent();
      editor?.commands.setContent(text);
      sendMessage(text);
    }
  }, [text]);

  useEffect(() => {
    if (transcribing) {
      editor?.setEditable(false);
    } else {
      editor?.setEditable(true);
    }
  }, [transcribing]);

  return (
    <Flex>
      <Tooltip content="Record">
        <Button size="icon" variant="ghost" onClick={startVoiceRecording}>
          <RecordIcon size={18} variant="stroke" strokeWidth="2" />
        </Button>
      </Tooltip>
      {transcribing && (
        <Flex
          items="center"
          justify="center"
          gap="sm"
          className="absolute inset-0 z-[50] h-full w-full bg-white/50 backdrop-blur-sm dark:bg-zinc-800/50"
        >
          <LinearSpinner /> <Type textColor="secondary">Transcribing ...</Type>
        </Flex>
      )}
      {recording && (
        <Flex
          className="fixed bottom-0 left-0 right-0 top-0 z-50 bg-white/90 backdrop-blur-sm dark:bg-zinc-800/90"
          direction="col"
          items="center"
          justify="center"
        >
          <Flex
            items="center"
            direction="col"
            gap="sm"
            justify="between"
            className="h-screen"
          >
            <Flex direction="row" gap="sm" items="center" className="p-6">
              <Flex
                gap="xs"
                items="center"
                className="rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-700"
              >
                <Type size="base" weight="medium" className="flex-shrink-0">
                  {formatTickerTime(elapsedTime)}
                </Type>
                <Type
                  textColor="tertiary"
                  size="base"
                  weight="medium"
                  className="flex-shrink-0"
                >
                  / 1:00
                </Type>
              </Flex>
            </Flex>

            <AudioVisualizer stream={stream} />

            <Flex gap="sm" className="w-full p-6" justify="center">
              <Button
                variant="secondary"
                rounded="full"
                size="lg"
                onClick={() => {
                  cancelRecording();
                }}
                className="group"
              >
                <Cancel01Icon size={18} strokeWidth="2" />
                Cancel
              </Button>
              <Button
                rounded="full"
                size="lg"
                onClick={() => {
                  stopRecording();
                }}
                className="group"
              >
                <Tick01Icon size={18} strokeWidth="2" />
                Done
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
