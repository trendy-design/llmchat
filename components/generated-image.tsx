import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, Flex } from "./ui";
export type TGeneratedImage = {
  image: string;
};
export const GeneratedImage = ({ image }: TGeneratedImage) => {
  const [error, setError] = useState(false);
  return (
    <Flex direction="col" gap="md" className="mb-4">
      {!error && (
        <img
          src={image}
          onError={(e) => {
            setError(true);
          }}
          alt=""
          className="h-[400px] w-[400px] rounded-lg border"
        />
      )}
      <Alert variant="warning">
        <AlertDescription className="flex flex-row items-center gap-2">
          <AlertCircle size={16} strokeWidth={2} />
          {error
            ? "The image has expired. Please generate a new one."
            : "This image will expire in 1 hour. Please copy it before it expires."}
        </AlertDescription>
      </Alert>
    </Flex>
  );
};
