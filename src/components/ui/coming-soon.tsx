import { Badge } from "./badge";

export const ComingSoon = () => {
  return (
    <Badge
      variant="secondary"
      className="bg-blue-400/50 text-blue-200 dark:text-blue-800 rounded-full font-normal"
    >
      Coming soon
    </Badge>
  );
};
