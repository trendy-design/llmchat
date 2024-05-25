import { useChatContext } from "@/context/chat/context";
import { useFilters } from "@/context/filters/context";
import { useSettings } from "@/context/settings/context";
import { useModelList } from "@/hooks/use-model-list";
import { usePreferences } from "@/hooks/use-preferences";
import { useRecordVoice } from "@/hooks/use-record-voice";
import useScrollToBottom from "@/hooks/use-scroll-to-bottom";
import { useTextSelection } from "@/hooks/usse-text-selection";
import { slideUpVariant } from "@/lib/framer-motion";
import { PromptType, RoleType, roles } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import HardBreak from "@tiptap/extension-hard-break";

import {
  ArrowDown,
  ArrowElbowDownRight,
  ArrowUp,
  ClockClockwise,
  Command,
  Microphone,
  Paperclip,
  Plus,
  Quotes,
  StopCircle,
  X,
} from "@phosphor-icons/react";
import { Stop } from "@phosphor-icons/react/dist/ssr";
import Document from "@tiptap/extension-document";
import Highlight from "@tiptap/extension-highlight";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";

import Text from "@tiptap/extension-text";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Resizer from "react-image-file-resizer";
import { ChatExamples } from "./chat-examples";
import { ModelSelect } from "./model-select";
import { AudioWaveSpinner } from "./ui/audio-wave";
import { Badge } from "./ui/badge";

import { removeExtraSpaces } from "@/lib/helper";
import { QuickSettings } from "./quick-settings";
import { Button } from "./ui/button";
import { ComingSoon } from "./ui/coming-soon";
import {
  Command as CMDKCommand,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Tooltip } from "./ui/tooltip";
import { useToast } from "./ui/use-toast";

export type TAttachment = {
  file?: File;
  base64?: string;
};

export const ChatInput = () => {
  const { sessionId } = useParams();
  const { open: openFilters } = useFilters();
  const { showButton, scrollToBottom } = useScrollToBottom();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPrompt, setSelectedPrompt] = useState<string>();
  const { startRecording, stopRecording, recording, text, transcribing } =
    useRecordVoice();
  const { runModel, createSession, currentSession, streaming, stopGeneration } =
    useChatContext();
  // const [inputValue, setInputValue] = useState("");
  const [contextValue, setContextValue] = useState<string>("");
  const { getPreferences, getApiKey } = usePreferences();
  const { getModelByKey } = useModelList();
  const { open: openSettings } = useSettings();
  const { showPopup, selectedText, handleClearSelection } = useTextSelection();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("");

  const [attachment, setAttachment] = useState<TAttachment>();

  const ShiftEnter = Extension.create({
    addKeyboardShortcuts() {
      return {
        "Shift-Enter": (_) => {
          return _.editor.commands.enter();
        },
      };
    },
  });

  const Enter = Extension.create({
    addKeyboardShortcuts() {
      return {
        Enter: (_) => {
          if (_.editor.getText()?.length > 0) {
            handleRunModel(_.editor.getText(), () => {
              _.editor.commands.clearContent();
              _.editor.commands.focus("end");
            });
          }
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Type / or Enter prompt here...",
      }),
      Enter,
      ShiftEnter,
      Highlight.configure({
        HTMLAttributes: {
          class: "prompt-highlight",
        },
      }),
      HardBreak,
    ],
    content: ``,
    autofocus: true,
    onTransaction(props) {
      const { editor } = props;
      const text = editor.getText();
      const html = editor.getHTML();
      if (text === "/") {
        setOpen(true);
      } else {
        console.log(text);
        const newHTML = html.replace(
          /{{{{(.*?)}}}}/g,
          ` <mark class="prompt-highlight">$1</mark> `
        );

        if (newHTML !== html) {
          editor.commands.setContent(newHTML, true, {
            preserveWhitespace: true,
          });
        }
        setOpen(false);
      }
    },
    parseOptions: {
      preserveWhitespace: true,
    },
  });

  useEffect(() => {
    if (editor?.isActive) {
      editor.commands.focus("end");
    }
  }, [editor?.isActive]);

  const resizeFile = (file: File) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1000,
        1000,
        "JPEG",
        100,
        0,
        (uri) => {
          console.log(typeof uri);
          resolve(uri);
        },
        "file"
      );
    });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const reader = new FileReader();

    const fileTypes = ["image/jpeg", "image/png", "image/gif"];
    if (file && !fileTypes.includes(file?.type)) {
      toast({
        title: "Invalid format",
        description: "Please select a valid image (JPEG, PNG, GIF).",
        variant: "destructive",
      });
      return;
    }

    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const base64String = reader?.result?.split(",")[1];
      setAttachment((prev) => ({
        ...prev,
        base64: `data:${file?.type};base64,${base64String}`,
      }));
    };

    if (file) {
      setAttachment((prev) => ({
        ...prev,
        file,
      }));
      const resizedFile = await resizeFile(file);

      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleRunModel = (query?: string, clear?: () => void) => {
    console.log("handleRunmodel");

    if (!query) {
      return;
    }
    getPreferences().then(async (preference) => {
      const selectedModel = getModelByKey(preference.defaultModel);

      if (
        selectedModel?.key &&
        !["gpt-4-turbo", "gpt-4o"].includes(selectedModel?.key) &&
        attachment?.base64
      ) {
        toast({
          title: "Ahh!",
          description: "This model does not support image input.",
          variant: "destructive",
        });
        return;
      }

      console.log(selectedModel?.baseModel);
      if (!selectedModel?.baseModel) {
        throw new Error("Model not found");
      }

      const apiKey = await getApiKey(selectedModel?.baseModel);
      console.log(apiKey);

      if (!apiKey) {
        toast({
          title: "Ahh!",
          description: "API key is missing. Please check your settings.",
          variant: "destructive",
        });
        openSettings(selectedModel?.baseModel);
        return;
      }
      runModel({
        sessionId: sessionId.toString(),
        props: {
          role: RoleType.assistant,
          type: PromptType.ask,
          image: attachment?.base64,
          query: removeExtraSpaces(query),
          context: removeExtraSpaces(contextValue),
        },
      });
      setAttachment(undefined);
      setContextValue("");

      console.log(editor);
      clear?.();
    });
  };

  useEffect(() => {
    if (sessionId) {
      inputRef.current?.focus();
    }
  }, [sessionId]);

  const isNewSession = !currentSession?.messages?.length;

  useEffect(() => {
    if (text) {
      editor?.commands.setContent(text);
      runModel({
        props: {
          role: RoleType.assistant,
          type: PromptType.ask,
          query: text,
        },
        sessionId: sessionId.toString(),
      });
      editor?.commands.clearContent();
    }
  }, [text]);

  const renderRecordingControls = () => {
    if (recording) {
      return (
        <>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => {
              stopRecording();
            }}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
          >
            <StopCircle size={20} weight="fill" className="text-red-300" />
          </Button>
        </>
      );
    }

    return (
      <Tooltip content="Record">
        <Button
          size="icon"
          variant="ghost"
          className="min-w-8 h-8"
          onClick={async () => {
            const apiKey = await getApiKey("openai");
            if (!apiKey) {
              toast({
                title: "API key missing",
                description:
                  "Recordings require OpenAI API key. Please check settings.",
                variant: "destructive",
              });
              openSettings("openai");
              return;
            }
            startRecording();
            setTimeout(() => {
              stopRecording();
            }, 20000);
          }}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
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

  const renderScrollToBottom = () => {
    if (showButton && !showPopup && !recording && !transcribing) {
      return (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Button onClick={scrollToBottom} variant="secondary" size="iconSm">
            <ArrowDown size={20} weight="bold" />
          </Button>
        </motion.span>
      );
    }
  };

  const renderReplyButton = () => {
    if (showPopup && !recording && !transcribing) {
      return (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Button
            onClick={() => {
              setContextValue(selectedText);
              handleClearSelection();
              inputRef.current?.focus();
            }}
            variant="secondary"
            size="sm"
          >
            <Quotes size={20} weight="bold" /> Reply
          </Button>
        </motion.span>
      );
    }
  };

  const renderStopButton = () => {
    return (
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        <Button
          onClick={() => {
            stopGeneration();
          }}
          variant="secondary"
          size="sm"
        >
          <Stop size={20} weight="bold" /> Stop
        </Button>
      </motion.span>
    );
  };

  const renderAttachedImage = () => {
    if (attachment?.base64 && attachment?.file) {
      return (
        <div className="flex flex-row items-center bg-black/30 text-zinc-300 rounded-xl h-10 w-full md:w-[700px] justify-start gap-2 pl-3 pr-1">
          <ArrowElbowDownRight size={20} weight="bold" />
          <p className="w-full relative ml-2 text-sm md:text-base flex flex-row gap-2 items-center">
            <Image
              src={attachment.base64}
              alt="uploaded image"
              className="rounded-xl tanslate-y-[50%] min-w-[60px] h-[60px] border border-white/5 absolute rotate-6 shadow-md object-cover"
              width={0}
              height={0}
            />
            <span className="ml-[70px]">{attachment?.file?.name}</span>
          </p>
          <Button
            size={"iconSm"}
            variant="ghost"
            onClick={() => {
              setContextValue("");
            }}
            className="flex-shrink-0 ml-4"
          >
            <X size={16} weight="bold" />
          </Button>
        </div>
      );
    }
  };

  const renderSelectedContext = () => {
    if (contextValue) {
      return (
        <div className="flex flex-row items-center bg-black/30 text-zinc-300 rounded-xl h-10 w-[700px] justify-start gap-2 pl-3 pr-1">
          <ArrowElbowDownRight size={16} weight="fill" />
          <p className="w-full overflow-hidden truncate ml-2 text-sm md:text-base ">
            {contextValue}
          </p>
          <Button
            size={"iconSm"}
            variant="ghost"
            onClick={() => {
              setContextValue("");
            }}
            className="flex-shrink-0 ml-4"
          >
            <X size={16} weight="bold" />
          </Button>
        </div>
      );
    }
  };

  const renderFileUpload = () => {
    return (
      <>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFileSelect}
          className="px-1.5"
        >
          <Paperclip size={16} weight="bold" /> Attach
        </Button>
      </>
    );
  };

  const clearInput = () => {
    editor?.commands.clearContent();
  };

  const focusToInput = () => {
    editor?.commands.focus("end");
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-end md:justify-center absolute bottom-0 px-2 md:px-4 pb-4 pt-16 bg-gradient-to-t transition-all ease-in-out duration-1000 from-white dark:from-zinc-800 to-transparent from-70% left-0 right-0 gap-1",
        isNewSession && "top-0 "
      )}
    >
      <div className="flex flex-row items-center gap-2">
        {renderScrollToBottom()}
        {renderReplyButton()}
        {renderListeningIndicator()}
      </div>
      <div className="flex flex-col  justify-center items-center">
        <ChatExamples
          show={isNewSession}
          onExampleClick={(prompt) => {
            handleRunModel(prompt, () => {
              clearInput();
              focusToInput();
            });
          }}
        />
      </div>
      <div className="flex flex-col gap-1 w-full md:w-[700px]">
        {renderSelectedContext()}
        {renderAttachedImage()}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor className="w-full">
            <motion.div
              variants={slideUpVariant}
              initial={"initial"}
              animate={editor?.isActive ? "animate" : "initial"}
              className="flex flex-col items-start gap-0 bg-zinc-50 dark:bg-white/5 w-full dark:border-white/5 rounded-2xl overflow-hidden"
            >
              <div className="flex flex-row items-end pl-2 md:pl-3 pr-2 py-2 w-full gap-0">
                {/* {renderNewSession()} */}
                <EditorContent
                  editor={editor}
                  autoFocus
                  className="w-full min-h-8 text-sm md:text-base max-h-[120px] overflow-y-auto outline-none focus:outline-none p-1 [&>*]:outline-none [&>*]:leading-6 wysiwyg cursor-text"
                />

                {renderRecordingControls()}

                <Button
                  size="icon"
                  variant={!!editor?.getText() ? "secondary" : "ghost"}
                  disabled={!editor?.getText()}
                  className="min-w-8 h-8 ml-1"
                  onClick={() =>
                    handleRunModel(editor?.getText(), () => {
                      clearInput();
                      focusToInput();
                    })
                  }
                >
                  <ArrowUp size={20} weight="bold" />
                </Button>
              </div>
            </motion.div>
          </PopoverAnchor>
          <PopoverContent
            side="top"
            sideOffset={4}
            className="min-w-[96vw] md:min-w-[700px] p-0 rounded-2xl overflow-hidden"
          >
            <CMDKCommand>
              <CommandInput
                placeholder="Search..."
                className="h-10"
                value={commandInput}
                onValueChange={setCommandInput}
                onKeyDown={(e) => {
                  if (
                    (e.key === "Delete" || e.key === "Backspace") &&
                    !commandInput
                  ) {
                    setOpen(false);
                    clearInput();
                    focusToInput();
                  }
                }}
              />
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandList className="p-2 max-h-[160px]">
                <CommandItem onSelect={() => {}} disabled={true}>
                  <Plus size={14} weight="bold" className="flex-shrink-0" />{" "}
                  Create New Prompt <ComingSoon />
                </CommandItem>
                {roles?.map((role, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      editor?.commands.setContent(role.content);
                      editor?.commands.insertContent("");
                      console.log(editor?.getText());
                      editor?.commands.focus("end");
                      setOpen(false);
                    }}
                  >
                    {role.name}
                  </CommandItem>
                ))}
              </CommandList>
            </CMDKCommand>
          </PopoverContent>
        </Popover>
        <div className="flex flex-row items-center w-full justify-start gap-0 pt-1 px-2">
          <ModelSelect />
          <QuickSettings />
          <div className="flex-1"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={openFilters}
            className="px-1.5"
          >
            <ClockClockwise size={16} weight="bold" /> History
            <Badge variant="outline">
              <Command size={16} weight="bold" /> K
            </Badge>
          </Button>
        </div>
        {isNewSession && (
          <div className="fixed bottom-0 left-0 right-0 w-full p-3 text-xs flex flex-row justify-center">
            <p className="text-xs text-zinc-500/50">
              P.S. Your data is stored locally on local storage, not in the
              cloud.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
