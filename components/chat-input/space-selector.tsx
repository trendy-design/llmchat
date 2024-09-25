import {
  Button,
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  Type,
} from "@/ui";
import { GalleryVerticalEnd } from "lucide-react";
import { FC } from "react";

export type SpaceSelector = {};

export const SpaceSelector: FC<SpaceSelector> = () => {
  return (
    <Tooltip content="Spaces (coming soon)" side="top" sideOffset={4}>
      <Popover>
        <PopoverTrigger>
          <Button size="icon-sm" variant="ghost">
            <GalleryVerticalEnd size={16} strokeWidth={2} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <Flex className="p-4" direction="col" items="center" justify="center">
            <GalleryVerticalEnd
              size={16}
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
