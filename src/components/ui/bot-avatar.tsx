import Avatar from "boring-avatars";

export type TBotAvatar = {
  name: string;
  size: number;
};

export const BotAvatar = ({ name, size }: TBotAvatar) => {
  return (
    <div className="rounded-xl flex-shrink-0 overflow-hidden border dark:border-white/10 border-transparent flex items-center justify-center">
      <Avatar
        size={size || 40}
        square
        name={name}
        variant="beam"
        colors={[
          "#ABECE9",
          "#F2FF00",
          "#FF9F15",
          "#FB797B",
          "#9D7342",
          "#3B8C91",
          "#272C2C",
        ]}
      />
    </div>
  );
};
