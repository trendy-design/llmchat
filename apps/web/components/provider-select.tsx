import { providers } from "@repo/shared/config";
import { TProvider } from "@repo/shared/types";
import {
    Button, ButtonProps, DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Flex,
    cn
} from "@repo/ui";
import { ChevronDown } from "lucide-react";
import { FC, useState } from "react";
import { ModelIcon } from "./model-icon";

export type TProviderSelect = {
  selectedProvider: TProvider;
  fullWidth?: boolean;
  variant?: ButtonProps["variant"];
  setSelectedProvider: (provider: TProvider) => void;
  className?: string;
};

export const ProviderSelect: FC<TProviderSelect> = ({
  selectedProvider,
  variant = "secondary",
  fullWidth,
  setSelectedProvider,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            className={cn("justify-start gap-2 text-xs md:text-sm", className)}
          >
            <ModelIcon type={selectedProvider} size="sm" />
            {selectedProvider}
            <Flex className="flex-1" />
            <ChevronDown size={14} strokeWidth="2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={4}
          className={cn(
            "no-scrollbar z-[610] max-h-[260px] overflow-y-auto text-xs md:text-sm",
            fullWidth ? "w-full" : "min-w-[250px]",
          )}
        >
          {providers
            ?.filter((a) => !["llmchat"].includes(a))
            .map((p) => {
              return (
                <DropdownMenuItem
                  className={cn(
                    "text-xs font-medium md:text-sm",
                    selectedProvider === p && "bg-zinc-50 dark:bg-black/30",
                  )}
                  key={p}
                  onClick={() => {
                    setSelectedProvider(p);
                    setIsOpen(false);
                  }}
                >
                  <ModelIcon type={p} size="sm" />
                  {p}
                </DropdownMenuItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
