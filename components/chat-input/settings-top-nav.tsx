import { useRootContext } from "@/libs/context/root";
import { Button, Flex, Type } from "@/ui";
import { ChevronLeft, FlagIcon, PanelLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { useFeedback } from "../feedback/use-feedback";
import { SettingsSidebar } from "../layout/settings-sidebar";

export const SettingsTopNav = () => {
  const { push } = useRouter();
  const { setOpen, renderModal } = useFeedback();

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useRootContext();

  return (
    <Flex
      className="sticky top-0 z-20 flex w-full rounded-t-md border-b border-zinc-500/10 bg-zinc-25 px-1 pb-0 pt-1 dark:bg-zinc-800 md:px-2 md:pt-2"
      direction="col"
    >
      <Flex
        direction="row"
        gap="xs"
        justify="between"
        items="center"
        className="w-full"
      >
        <Flex gap="xs" items="center">
          <Button
            variant="ghost"
            size="iconSm"
            className="flex lg:hidden"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <PanelLeft size={16} strokeWidth={2} />
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            className="hidden lg:flex"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <PanelLeft size={16} strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="iconSm" onClick={() => push("/chat")}>
            <ChevronLeft size={16} strokeWidth={2} />
          </Button>
          <Type weight="medium">Settings</Type>
        </Flex>
        <Flex gap="xs" items="center">
          <Button
            variant="bordered"
            size="sm"
            onClick={() => {
              window.open("https://git.new/llmchat", "_blank");
            }}
          >
            <FaGithub size={16} />
            <span className="hidden md:block">Star on Github</span>
          </Button>
          <Button
            variant="bordered"
            size="sm"
            onClick={() => {
              setOpen(true);
            }}
          >
            <FlagIcon size={16} className="block md:hidden" />
            <span className="hidden md:block">Feedback</span>
          </Button>
        </Flex>
      </Flex>
      <Flex direction="row" className="w-full pt-2">
        <SettingsSidebar />
      </Flex>
      {renderModal()}
    </Flex>
  );
};
