import Image from 'next/image';

export type ImageMessageProps = {
  image?: string;
};

export const ImageMessage = ({ image }: ImageMessageProps) => {
  if (!image) return null;

  return (
    <Image
      src={image}
      alt="uploaded image"
      className="h-[100px] w-auto overflow-hidden rounded-xl border border-white/5 object-cover shadow-md"
      width={0}
      sizes="50vw"
      height={0}
    />
  );
};
