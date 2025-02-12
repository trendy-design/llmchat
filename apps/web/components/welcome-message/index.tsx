"use client";

import { cn } from "@repo/shared/utils";
import { Button, Dialog, DialogContent, Flex, Type } from "@repo/ui";

import {
  ArrowRight,
  Lock,
  LucideIcon,
  MessageCircle,
  Rocket,
  ToyBrick,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { AiModelsCopy } from "./ai-models-copy";
import { CustomAssistantCopy } from "./custom-assistant-copy";
import { OpenSourceCopy } from "./opensource-copy";
import { PluginCopy } from "./plugin-copy";
import { PrivacyCopy } from "./privacy-copy";

export type TWelcomeMessageProps = {
  show: boolean;
};

export type WelcomePoint = {
  icon: LucideIcon;
  text: React.ReactNode;
};

const welcomePoints: WelcomePoint[] = [
  {
    icon: MessageCircle,
    text: <AiModelsCopy />,
  },
  {
    icon: ToyBrick,
    text: <PluginCopy />,
  },
  {
    icon: WandSparkles,
    text: <CustomAssistantCopy />,
  },
  {
    icon: Lock,
    text: <PrivacyCopy />,
  },
  {
    icon: Rocket,
    text: <OpenSourceCopy />,
  },
];

export const WelcomeMessage = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wasShown = localStorage?.getItem("welcomeMessageShown");
      if (wasShown !== "true") {
        const timer = setTimeout(() => {
          setOpen(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (typeof window !== "undefined") {
      localStorage?.setItem("welcomeMessageShown", "true");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        localStorage.setItem("welcomeMessageShown", "true");
      }}
    >
      <DialogContent
        ariaTitle="Welcome Message"
        className="max-w-80vw rounded-xl md:max-w-[660px]"
      >
        <div className="flex w-full flex-row items-start justify-start gap-2">
          <div className="flex w-full scale-95 flex-col items-start md:scale-100 md:flex-row">
            <Flex
              direction="col"
              gap="lg"
              items="start"
              className="w-full flex-1 overflow-hidden p-0 md:p-4"
            >
              <Type size="lg" className="pb-2">
                Your Ultimate
                <Flex className="mx-1 inline-block">
                  <Image
                    src={"./icons/handdrawn_spark.svg"}
                    width={0}
                    alt="spark"
                    height={0}
                    className={cn(
                      "relative mx-1 h-4 w-10 translate-y-1 overflow-hidden dark:invert",
                    )}
                    sizes="100vw"
                  />
                </Flex>
                Chat Experience Awaits!
              </Type>
              <Flex direction="col" gap="xl" items="start">
                {welcomePoints.map((point, index) => {
                  const Icon = point.icon;
                  return (
                    <Type
                      key={index}
                      size="sm"
                      textColor="secondary"
                      className="flex gap-3"
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.5}
                        className="mt-1 flex-shrink-0"
                      />
                      <p className="inline-block leading-7 md:leading-6">
                        {point.text}
                      </p>
                    </Type>
                  );
                })}
              </Flex>
              <Type size="sm" textColor="secondary" className="pt-2">
                Start chatting now - it&apos;s{" "}
                <Image
                  src={"./icons/handdrawn_free.svg"}
                  width={0}
                  alt="sparck"
                  height={0}
                  className="mx-2 inline-block w-10 text-teal-400 dark:invert"
                />{" "}
                no sign-up needed!
              </Type>
              <Flex gap="md">
                <Button size="md" variant="default" onClick={handleClose}>
                  Start Chatting <ArrowRight size={16} />
                </Button>
                <Button
                  size="md"
                  variant="bordered"
                  onClick={() =>
                    window.open("https://git.new/llmchat", "_blank")
                  }
                >
                  <FaGithub size={16} /> Github Repo
                </Button>
              </Flex>
            </Flex>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
