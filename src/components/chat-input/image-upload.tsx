import { Button, Tooltip } from "@/components/ui";
import { ImageAdd01Icon } from "@hugeicons/react";
import { FC } from "react";

export type TImageUpload = {
  id: string;
  label: string;
  tooltip: string;
  showIcon: boolean;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ImageUpload: FC<TImageUpload> = ({
  id,
  label,
  tooltip,
  showIcon,
  handleImageUpload,
}) => {
  const handleFileSelect = () => {
    document.getElementById(id)?.click();
  };

  return (
    <>
      <input
        type="file"
        id={id}
        className="hidden"
        onChange={handleImageUpload}
      />
      <Tooltip content={tooltip}>
        {showIcon ? (
          <Button variant="ghost" size="iconSm" onClick={handleFileSelect}>
            <ImageAdd01Icon size={18} strokeWidth={2} />
          </Button>
        ) : (
          <Button variant="outlined" onClick={handleFileSelect}>
            {label}
          </Button>
        )}
      </Tooltip>
    </>
  );
};
