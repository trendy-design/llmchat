import { Button, Tooltip } from "@/ui";
import { ImagePlus } from "lucide-react";
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
            <ImagePlus size={18} strokeWidth={2} />
          </Button>
        ) : (
          <Button variant="bordered" onClick={handleFileSelect}>
            {label}
          </Button>
        )}
      </Tooltip>
    </>
  );
};
