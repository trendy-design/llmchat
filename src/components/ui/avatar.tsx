import { default as BoringAvatar } from "boring-avatars";

export type TAvatar = {
  name: string;
  size?: number;
};
export const Avatar = ({ name, size }: TAvatar) => {
  return (
    <div className="rounded-full relative">
      <BoringAvatar
        size={size || 32}
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
