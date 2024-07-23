export type TSettingsContainer = {
  children: React.ReactNode;
  title: string;
};
export const SettingsContainer = ({ title, children }: TSettingsContainer) => {
  return (
    <div className="px-3 md:px-5 flex flex-col items-start gap-2">
      <p className="text-xl font-medium text-zinc-800 dark:text-white pt-4 pb-2">
        {title}
      </p>
      {children}
    </div>
  );
};
