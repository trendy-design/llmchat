import { Block } from "@/libs/store/chat.store";
import { CodeBlock } from "@repo/ui";
import { Button } from "@repo/ui/src/components/button";
import ReactMarkdown from "react-markdown";

export const ThreadBlockMetadata = ({ block }: { block: Block }) => {
        const copyToClipboard = (element: HTMLElement | null) => {
          if (!element) return;
          
          const text = element.innerText;
          navigator.clipboard.writeText(text).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          });
        };
    
        return (
          <div className="flex w-full flex-col gap-4">
            {Object.entries(block).map(([key, value]) => (
              <div className="flex flex-col gap-2" key={key}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-800">{key}</p>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      const contentElement = e.currentTarget.parentElement?.nextElementSibling;
                      copyToClipboard(contentElement as HTMLElement);
                    }}
                  >
                    Copy
                  </Button>
                </div>
                {["toolCalls", "toolCallResults", "history", "nodeError"].includes(key) ? (
                  <p className="text-xs text-zinc-500 prose prose-sm">
                        <CodeBlock code={JSON.stringify(value, null, 2)} lang="json" />
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500 prose prose-sm">
                    <ReactMarkdown>{value?.toString()}</ReactMarkdown>
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      };
    
    