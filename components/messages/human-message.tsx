import { TChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils/clsx";
import { useAuth } from "@/libs/context";
import { Flex, Type } from "@/ui";
import Avvvatars from "avvvatars-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type THumanMessage = {
  chatMessage: TChatMessage;
};

export const HumanMessage = ({ chatMessage }: THumanMessage) => {
  const { rawHuman } = chatMessage;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (contentRef.current) {
      setShowReadMore(
        contentRef.current.scrollHeight > contentRef.current.clientHeight,
      );
    }
  }, [rawHuman]);

  if (!rawHuman) return null;

  return (
    <div className="relative w-full">
      <Flex className="w-full items-start" gap="md">
        <Flex className="mt-0.5">
          <Avvvatars
            displayValue={user?.email?.charAt(0) || "A"}
            value={user?.email || "LLMChat"}
            style={user?.email ? "character" : "shape"}
            size={26}
          />
        </Flex>
        <Flex direction="col" className="mt-1 flex-1" gap="sm">
          <Type
            weight="medium"
            className={cn("relative whitespace-break-spaces text-left", {
              "line-clamp-2": !isExpanded,
            })}
            ref={contentRef}
          >
            {rawHuman}
          </Type>
          {showReadMore && (
            <Type
              onClick={(e) => {
                setIsExpanded(!isExpanded);
                e.stopPropagation();
              }}
              className="items-center gap-1 opacity-60 hover:underline hover:opacity-100"
            >
              {isExpanded ? (
                <>
                  <ArrowUp size={14} strokeWidth={2} />
                  Read Less
                </>
              ) : (
                <>
                  <ArrowDown size={14} strokeWidth={2} />
                  Read More
                </>
              )}
            </Type>
          )}
        </Flex>
      </Flex>
    </div>
  );
};
