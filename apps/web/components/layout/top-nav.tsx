import { useRootContext } from '@/libs/context/root';
import { Button, Flex, Type, cn } from '@repo/ui';
import { ChevronLeft, FlagIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { useFeedback } from '../feedback/use-feedback';

interface TopNavProps {
  title?: string;
  showBackButton?: boolean;
  children?: ReactNode;
  borderBottom?: boolean;
}

export const TopNav = ({
  title,
  showBackButton = false,
  children,
  borderBottom = true,
}: TopNavProps) => {
  const { push } = useRouter();
  const { setOpen, renderModal } = useFeedback();
  const { isSidebarOpen, setIsSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen } =
    useRootContext();

  return (
    <Flex
      className={cn(
        'sticky top-0 z-20 flex w-full rounded-t-md border-zinc-500/10 p-1 md:p-3 dark:bg-zinc-800'
      )}
      direction="col"
    >
      <Flex direction="row" gap="xs" justify="between" items="center" className="w-full">
        <Flex gap="xs" items="center">
          {/* <Button
            variant="ghost"
            size="icon-sm"
            className="flex lg:hidden"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <PanelLeft size={16} strokeWidth={2} />
          </Button> */}

          {/* <Button
            variant="ghost"
            size="icon-sm"
            className="hidden lg:flex"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <PanelLeft size={16} strokeWidth={2} />
          </Button> */}
          {showBackButton && (
            <Button variant="ghost" size="icon-sm" onClick={() => push('/chat')}>
              <ChevronLeft size={16} strokeWidth={2} />
            </Button>
          )}
          {title && <Type weight="medium">{title}</Type>}
          {children}
        </Flex>
        <Flex gap="xs" items="center">
          {/* <Button
            variant="bordered"
            size="sm"
            onClick={() => {
              window.open("https://git.new/llmchat", "_blank");
            }}
          >
            <FaGithub size={16} />
            <span className="hidden md:block">Star on Github</span>
          </Button> */}
          <Button
            variant="bordered"
            size="xs"
            onClick={() => {
              setOpen(true);
            }}
          >
            <FlagIcon size={16} className="block md:hidden" />
            <span className="hidden md:block">Feedback</span>
          </Button>
        </Flex>
      </Flex>
      {renderModal()}
    </Flex>
  );
};
