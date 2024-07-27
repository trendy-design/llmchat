"use client";
import { Button, Flex, Type } from "@/components/ui";
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
    <main className="relative flex w-screen flex-col items-center gap-2 pt-[20vh]">
      <Flex direction="col" items="center" gap="md" className="">
        <Button variant="accent" size="sm" rounded="full">
          <NewTwitterIcon size={20} variant="solid" />
          Follow us on X
        </Button>
        <Flex
          direction="col"
          items="center"
          className="text-center !text-[6rem] font-semibold leading-[1.1] tracking-[-0.03em]"
        >
          <span className="opacity-50">Your Ultimate</span>
          <span className="flex items-center opacity-100">
            <AiMagicIcon size={60} variant="bulk" /> AI Copilot
          </span>
        </Flex>
        <Type className="text-center !text-lg font-medium opacity-60">
          Navigate the AI landscape with ease Your personal co-pilot for all
          things AI.
        </Type>
      </Flex>
      <Button size="lg" className="mt-4" onClick={() => push("/chat")}>
        Get Started for Free
      </Button>
      <Flex className="absolute bottom-0 w-full p-2" justify="center">
        <Flex gap="sm" items="center">
          <Type size="xs" textColor="tertiary">
            Copyright © 2024 Trendy.design. All rights reserved.
          </Type>
          <Type size="xs" textColor="tertiary">
            <Link href="/privacy">Privacy Policy</Link>
          </Type>
          <Type size="xs" textColor="tertiary">
            <Link href="/terms">Terms of Service</Link>
          </Type>
          <Button size="iconSm" variant="ghost">
            <Github01Icon size={20} variant="solid" />
          </Button>
          <Button size="iconSm" variant="ghost">
            <NewTwitterEllipseIcon size={20} variant="solid" />
          </Button>
        </Flex>
      </Flex>
    </main>
  );
}
