import { Badge } from './badge';

export const ComingSoon = () => {
  return (
    <Badge
      variant="secondary"
      className="rounded-full bg-blue-400/50 font-normal text-blue-200 dark:text-blue-800"
    >
      Coming soon
    </Badge>
  );
};
