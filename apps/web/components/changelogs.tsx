import { getRelativeDate } from '@repo/shared/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  Dialog,
  DialogContent,
  Flex,
  Type,
} from '@repo/ui';
import { useQuery } from '@tanstack/react-query';
import Autoplay from 'embla-carousel-autoplay';
import { Flame } from 'lucide-react';
import Image from 'next/image';
import { Mdx } from './mdx';

export type Changelog = {
  id: string;
  images: string[];
  content: string;
  title: string;
  created_at: string;
};

export type ChangelogsProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const ChangeLogs = ({ open, setOpen }: ChangelogsProps) => {
  const { data, error } = useQuery<{ changelogs: Changelog[] }>({
    queryKey: ['changelogs'],
    queryFn: () => fetch('/api/changelogs').then(res => res.json()),
    staleTime: 1000 * 60 * 30, // 30 min
  });

  const changelogs = data?.changelogs || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        ariaTitle="Changelog"
        className="no-scrollbar max-h-[80vh] !max-w-[500px] gap-0 overflow-y-auto rounded-xl p-0"
      >
        <Flex className="w-full border-b py-3" justify="center">
          <Type size="base" weight="bold">
            <Flame size={20} /> What&apos;s new
          </Type>
        </Flex>
        {changelogs?.map(changelog => (
          <Flex key={changelog.id} className="px-6 py-4" direction="col" gap="md">
            <Flex direction="col" gap="none">
              <Type size="lg" weight="medium">
                {changelog.title}
              </Type>
              <Type size="sm" textColor="secondary">
                {getRelativeDate(changelog.created_at)}
              </Type>
            </Flex>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 2000,
                }),
              ]}
              className="w-full overflow-hidden rounded-xl bg-stone-500/10"
            >
              <CarouselContent>
                {changelog.images.map(image => (
                  <CarouselItem key={image}>
                    <Image
                      src={image}
                      alt={changelog.title}
                      width={0}
                      height={0}
                      className="h-auto w-full object-cover"
                      sizes="100vw"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <Flex direction="col" gap="md">
              <Mdx message={changelog.content} animate={true} size="sm" messageId={changelog.id} />
            </Flex>
          </Flex>
        ))}
      </DialogContent>
    </Dialog>
  );
};
