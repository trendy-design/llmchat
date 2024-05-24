import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { ArrowClockwise } from "@phosphor-icons/react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip } from "./ui/tooltip";

export type TRegenerateModelSelect = {
  onRegenerate: (modelKey: TModelKey) => void;
};

export const RegenerateWithModelSelect = ({
  onRegenerate,
}: TRegenerateModelSelect) => {
  const { models } = useModelList();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content="Regenerate">
          <DropdownMenuTrigger asChild>
            {
              <Button variant="ghost" size="iconSm" rounded="lg">
                <ArrowClockwise size={16} weight="bold" />
              </Button>
            }
          </DropdownMenuTrigger>
        </Tooltip>

        <DropdownMenuContent className="min-w-[250px] h-[300px] no-scrollbar overflow-y-auto">
          {models.map((model) => (
            <DropdownMenuItem
              key={model.key}
              onClick={() => {
                onRegenerate(model.key);
              }}
            >
              {model.icon()} {model.name} {model.isNew && <Badge>New</Badge>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
