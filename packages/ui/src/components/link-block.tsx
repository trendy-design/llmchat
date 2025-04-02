'use client';

import { LinkFavicon } from '@repo/common/components';
import { Source } from '@repo/shared/types';
import { getHost } from '@repo/shared/utils';
import React, { memo } from 'react';

export type LinkPreviewType = {
    url: string;
    children: React.ReactNode;
};

export const WebsitePreview = memo(({ source }: { source: Source }) => {
    return (
        <div className="not-prose">
            <div className="flex flex-col items-start">
                <div className="flex w-full flex-col items-start gap-1.5">
                    <div className="flex flex-row items-start gap-2.5">
                        <div className="flex flex-col items-start gap-4">
                            <p className="text-muted-foreground line-clamp-1 flex w-full flex-row items-center gap-2 font-sans text-xs">
                                <LinkFavicon link={source.link} size="md" />
                                {getHost(source.link)}
                            </p>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-foreground line-clamp-2 w-full overflow-hidden font-sans text-xs font-semibold leading-tight">
                                    {source.title}
                                </p>

                                <p className="text-muted-foreground line-clamp-2 w-full font-sans text-xs">
                                    {source?.snippet}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
