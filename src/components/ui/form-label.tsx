export type TFormLabel = {
  children?: React.ReactNode;
  label: string;
  isOptional?: boolean;
};
export const FormLabel = ({ children, label, isOptional }: TFormLabel) => {
  return (
    <div className="flex w-full flex-col items-start gap-0">
      <p className="text-xs font-medium text-zinc-800 dark:text-white md:text-sm">
        {label}
        {isOptional && <span className="text-zinc-500"> (Optional)</span>}
      </p>
      {children && (
        <p className="text-xs leading-5 text-zinc-500">{children}</p>
      )}
    </div>
  );
};
