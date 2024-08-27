import { useChatContext } from "@/lib/context";
import { cn } from "@/lib/utils/clsx";
import { Flex, Type } from "@/ui";

import {
  Lock,
  LucideIcon,
  MessageCircle,
  Rocket,
  ToyBrick,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import { ChatExamples } from "../chat-input/chat-examples";
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

export const WelcomeMessage = ({ show }: TWelcomeMessageProps) => {
  const { store } = useChatContext();

  const messages = store((state) => state.messages);
  const currentMessage = store((state) => state.currentMessage);
  const isFreshSession = !messages?.length && !currentMessage;

  if (!show || !isFreshSession) return null;

  return (
    <div className="flex w-full flex-row items-start justify-start gap-2">
      <div className="flex w-full scale-95 flex-col items-start md:scale-100 md:flex-row">
        <Flex
          direction="col"
          gap="md"
          items="start"
          className="w-full flex-1 overflow-hidden px-0 md:px-8"
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
          <div
            className="relative mx-1 my-3 h-2 w-full opacity-10 dark:invert"
            style={{
              backgroundImage: 'url("./icons/wavy.svg")',
              backgroundRepeat: "repeat-x",
              backgroundSize: "contain",
              backgroundPosition: "0 0",
            }}
          />
          <ChatExamples />
        </Flex>
      </div>
    </div>
  );
};
