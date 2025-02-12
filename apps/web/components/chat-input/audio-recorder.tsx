import { useChatContext } from "@/lib/context";
import { useRecordVoice } from "@/lib/hooks";
import { formatTickerTime } from "@repo/shared/utils";
import {
  AudioVisualizer,
  Button,
  Dialog,
  DialogContent,
  Flex,
  LinearSpinner,
  Tooltip,
  Type,
} from "@repo/ui";
import { Check, Circle, X } from "lucide-react";
import { FC, useEffect, useState } from "react";

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

  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalElement(document.body);
  }, []);

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
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => {
            startVoiceRecording();
          }}
        >
          <Circle size={16} strokeWidth="2" />
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

      <Dialog
        open={recording}
        onOpenChange={() => {
          cancelRecording();
        }}
      >
        <DialogContent ariaTitle="Record Voice" className="!max-w-[400px]">
          <Flex direction="col" items="center" justify="center">
            <Flex items="center" direction="col" gap="sm" justify="between">
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
                  <X size={16} strokeWidth="2" />
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
                  <Check size={16} strokeWidth="2" />
                  Done
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </DialogContent>
      </Dialog>
    </Flex>
  );
};
