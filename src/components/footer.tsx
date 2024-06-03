export type TFooter = {
  show: boolean;
};
export const Footer = ({ show }: TFooter) => {
  if (!show) {
    return null;
  }
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full p-3 text-xs flex flex-row justify-center">
      <p className="text-xs text-zinc-500/50">
        P.S. Your data is stored locally on local storage, not in the cloud.
      </p>
    </div>
  );
};
