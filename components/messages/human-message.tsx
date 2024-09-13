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
      <Flex className="w-full items-center" gap="lg">
        <Avvvatars
          value={user?.email || "LLMChat"}
          style={user?.email ? "character" : "shape"}
          size={24}
        />
        <Flex direction="col" className="flex-1">
          <Type
            size="base"
            weight="medium"
            className={cn(
              "relative whitespace-break-spaces text-left leading-7",
              {
                "line-clamp-2": !isExpanded,
              },
            )}
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
              className="items-center gap-1 py-1 opacity-60 hover:underline hover:opacity-100"
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
