import { Button } from "@/components/ui/button";
import { FolderLibraryIcon } from "@hugeicons/react";
import { FC } from "react";
import {
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  Type,
} from "../ui";

export type SpaceSelector = {};

export const SpaceSelector: FC<SpaceSelector> = () => {
  return (
    <Tooltip content="Spaces (coming soon)" side="top" sideOffset={4}>
      <Popover>
        <PopoverTrigger>
          <Button size="iconSm" variant="ghost">
            <FolderLibraryIcon size={18} strokeWidth={2} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <Flex className="p-4" direction="col" items="center" justify="center">
            <FolderLibraryIcon
              size={18}
              strokeWidth={2}
              className="mb-2 text-zinc-500"
            />

            <Type size="sm" textColor="secondary">
              Knowledge Spaces
            </Type>
            <Type size="sm" textColor="tertiary">
              (coming soon)
            </Type>
          </Flex>
        </PopoverContent>
      </Popover>
    </Tooltip>
  );
};
