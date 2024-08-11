import { cn } from "@/helper/clsx";
import { TChatMessage } from "@/types";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { Type } from "../ui";

export type THumanMessage = {
  chatMessage: TChatMessage;
};

export const HumanMessage = ({ chatMessage }: THumanMessage) => {
  const { rawHuman } = chatMessage;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
      <Type
        size="lg"
        weight="medium"
        className={cn("relative text-left leading-7", {
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
          className="items-center gap-1 py-1 opacity-60 hover:underline hover:opacity-100"
        >
          {isExpanded ? (
            <>
              <ArrowUp01Icon className="h-4 w-4" />
              Read Less
            </>
          ) : (
            <>
              <ArrowDown01Icon className="h-4 w-4" />
              Read More
            </>
          )}
        </Type>
      )}
    </div>
  );
};
