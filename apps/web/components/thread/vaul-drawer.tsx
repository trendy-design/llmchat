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
      <Drawer.Trigger asChild>
        {children}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content
          className="right-2 top-2 bottom-2 fixed z-10 outline-none w-[610px] flex"
          style={{ '--initial-transform': 'calc(100% + 8px)' } as CSSProperties}
        >
          <div className="bg-zinc-50 h-full overflow-y-auto w-full grow p-5 flex flex-col rounded-[16px]">
            {renderContent()}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
} 