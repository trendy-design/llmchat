export type TSettingsContainer = {
  children: React.ReactNode;
  title: string;
};
export const SettingsContainer = ({ title, children }: TSettingsContainer) => {
  return (
    <div className="px-3 md:px-6 flex flex-col items-start gap-2">
      <p className="text-md font-medium text-zinc-800 dark:text-white py-4">
        {title}
      </p>
      {children}
    </div>
  );
};
