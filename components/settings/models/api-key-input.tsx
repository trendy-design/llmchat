import { Flex } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FC, useState } from "react";
export type TApiKeyInput = {
  value?: string;
  setValue: (key: string) => void;
  isDisabled: boolean;
  placeholder: string;
  isLocked: boolean;
};

const ApiKeyInput: FC<TApiKeyInput> = ({
  value,
  setValue,
  isDisabled,
  placeholder,
  isLocked,
}) => {
  const [showKey, setShowKey] = useState<boolean>(false);

  return (
    <div className="relative flex w-full flex-row items-center gap-2">
      <Input
        placeholder={placeholder}
        value={value}
        disabled={isDisabled}
        type={showKey ? "text" : "password"}
        autoComplete="off"
        className="w-full pr-16"
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <Flex items="center" gap="sm" className="absolute right-2">
        {isLocked && (
          <Lock size={14} strokeWidth={2} className="text-zinc-500" />
        )}
        <Button
          variant="ghost"
          size="iconXS"
          onClick={() => setShowKey(!showKey)}
        >
          {showKey ? (
            <EyeOff size={16} strokeWidth={2} />
          ) : (
            <Eye size={16} strokeWidth={2} />
          )}
        </Button>
      </Flex>
    </div>
  );
};

export default ApiKeyInput;
