'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Drawer } from 'vaul';

type VaulDrawerProps = {
  children: ReactNode;
  renderContent: () => ReactNode;
};

export function VaulDrawer({ children, renderContent }: VaulDrawerProps) {
  return (
    <Drawer.Root direction="right">
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="bg-background/70 fixed inset-0" />
        <Drawer.Content
          className="bg-secondary fixed bottom-2 right-2 top-2 z-10 flex w-[610px] outline-none"
          style={{ '--initial-transform': 'calc(100% + 8px)' } as CSSProperties}
        >
          <div className="bg-secondary flex h-full w-full grow flex-col overflow-y-auto rounded-[16px] p-5">
            {renderContent()}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
