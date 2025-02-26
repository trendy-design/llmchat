'use client';

import type { ReactNode } from 'react';
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
        <Drawer.Overlay className="fixed inset-0 bg-secondary/90" />
        <Drawer.Content
          className="fixed bottom-2 overflow-hidden rounded-lg  right-2 bg-secondary top-2 z-10 flex w-[610px] outline-none"
        >
          <div className="flex h-full w-full grow flex-col border border-border overflow-y-auto rounded-[16px] bg-secondary p-6">
            {renderContent()}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
