"use client";
import { Button, Flex, Type } from "@/components/ui";
import { configs } from "@/config";
import {
  AiMagicIcon,
  Github01Icon,
  NewTwitterEllipseIcon,
  NewTwitterIcon,
} from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const { push } = useRouter();
  return (
    <main className="relative flex min-h-screen w-screen flex-col items-center justify-start gap-2 pt-[10vh]">
      <Flex direction="col" items="center" gap="md" className="">
        <Button variant="accent" size="sm" rounded="full">
          <NewTwitterIcon size={20} variant="solid" />
          Follow us on X
        </Button>
        <Flex
          direction="col"
          items="center"
          className="text-center !text-[3rem] font-semibold leading-[1.1] tracking-[-0.03em] md:!text-[6rem]"
        >
          <span className="opacity-50">Your Ultimate</span>
          <span className="flex items-center opacity-100">
            <AiMagicIcon className="h-10 w-10 md:h-16 md:w-16" variant="bulk" />{" "}
            AI Copilot
          </span>
        </Flex>
        <Type className="max-w-[500px] px-6 text-center !text-base font-medium opacity-60 md:!text-lg">
          Navigate the AI landscape with ease Your personal co-pilot for all
          things AI.
        </Type>
      </Flex>
      <Button size="lg" className="mb-12 mt-4" onClick={() => push("/chat")}>
        Get Started for Free
      </Button>

      <video
        src={configs.heroVideo}
        autoPlay
        loop
        muted
        className="w-[90vw] rounded-xl object-cover md:w-[70vw]"
      />
      <Flex
        direction="col"
        className="mt-8 w-full p-4"
        gap="none"
        items="center"
      >
        <Flex gap="sm" items="center">
          <Button size="iconSm" variant="ghost">
            <Github01Icon size={20} variant="solid" />
          </Button>
          <Button size="iconSm" variant="ghost">
            <NewTwitterEllipseIcon size={20} variant="solid" />
          </Button>
        </Flex>
        <Flex gap="sm" items="center">
          <Type size="xs" textColor="tertiary">
            © 2024 Trendy.design
          </Type>
          <Type size="xs" textColor="tertiary">
            <Link href="/privacy">Privacy Policy</Link>
          </Type>
          <Type size="xs" textColor="tertiary">
            <Link href="/terms">Terms of Service</Link>
          </Type>
        </Flex>
      </Flex>
    </main>
  );
}
