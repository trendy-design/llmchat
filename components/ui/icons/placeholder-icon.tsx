export type TPlaceholderIconProps = {
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: any;
  variant?: any;
};
export const PlaceholderIcon = ({
  size,
  color,
  className,
  strokeWidth,
}: TPlaceholderIconProps) => {
  return <div className="w-4 h-4 rounded-md bg-white/10"></div>;
};
