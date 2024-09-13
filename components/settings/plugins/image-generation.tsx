import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";
import { usePreferenceContext } from "@/lib/context";
import { TPreferences } from "@/lib/types";
import { ChevronDown } from "lucide-react";

export const ImageGenerationPlugin = () => {
  const { preferences, updatePreferences } = usePreferenceContext();

  const dalleImageQualities = {
    standard: "Standard",
    hd: "HD",
  };
  const dalleImageSizes = ["1024x1024", "1792x1024", "1024x1792"];
  return (
    <Flex direction="col" gap="sm" className="border-t border-white/10 pt-2">
      <Flex className="w-full" justify="between" items="center">
        <Type size="sm" textColor="secondary">
          Image Quality
        </Type>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary">
              {preferences.dalleImageQuality}{" "}
              <ChevronDown size={12} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]" align="end">
            {Object.keys(dalleImageQualities).map((quality) => (
              <DropdownMenuItem
                key={quality}
                onClick={() => {
                  updatePreferences({
                    dalleImageQuality:
                      quality as TPreferences["dalleImageQuality"],
                  });
                }}
              >
                {
                  dalleImageQualities[
                    quality as TPreferences["dalleImageQuality"]
                  ]
                }
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
      <Flex className="w-full" justify="between" items="center">
        <Type size="sm" textColor="secondary">
          Image Size
        </Type>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary">
              {preferences.dalleImageSize}
              <ChevronDown size={12} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[200px]" align="end">
            {dalleImageSizes.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => {
                  updatePreferences({
                    dalleImageSize: size as TPreferences["dalleImageSize"],
                  });
                }}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
    </Flex>
  );
};
