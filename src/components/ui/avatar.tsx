import { default as BoringAvatar } from "boring-avatars";

export type TAvatar = {
  name: string;
};
export const Avatar = ({ name }: TAvatar) => {
  return (
    <div className="w-8 h-8 rounded-full relative">
      <BoringAvatar
        size={32}
        name={name}
        variant="marble"
        colors={["#FFFFFF"]}
      />
      <p className="text-zinc-900/70 font-bold uppercase absolute inset-0 flex items-center justify-center">
        {name?.[0]}
      </p>
    </div>
  );
};
