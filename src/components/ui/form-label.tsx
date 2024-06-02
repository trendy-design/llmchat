export type TFormLabel = {
  children?: React.ReactNode;
  label: string;
};
export const FormLabel = ({ children, label }: TFormLabel) => {
  return (
    <div className="flex flex-col w-full gap-0 items-start">
      <p className="text-xs md:text-sm font-medium text-zinc-800 dark:text-white">
        {label}
      </p>
      {children && (
        <p className="text-xs text-zinc-500 leading-5">{children}</p>
      )}
    </div>
  );
};
