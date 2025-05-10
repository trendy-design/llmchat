import { useChatStore } from '@repo/common/store';
import { Badge } from '@repo/ui/src/components/badge';
import { IconBoltFilled } from '@tabler/icons-react';
import moment from 'moment';

export const CreditsSettings = () => {
    const remainingCredits = useChatStore(state => state.creditLimit.remaining);
    const maxLimit = useChatStore(state => state.creditLimit.maxLimit);
    const resetDate = useChatStore(state => state.creditLimit.reset);

    const info = [
        {
            title: 'Plan',
            value: (
                <Badge variant="secondary" className="bg-brand/10 text-brand rounded-full">
                    <span className="text-xs font-medium">FREE</span>
                </Badge>
            ),
        },
        {
            title: 'Credits',
            value: (
                <div className="flex h-7 flex-row items-center gap-1 rounded-full py-1">
                    <IconBoltFilled size={14} strokeWidth={2} className="text-brand" />
                    <span className="text-brand text-sm font-medium">{remainingCredits}</span>
                    <span className="text-brand text-sm opacity-50">/</span>
                    <span className="text-brand text-sm opacity-50">{maxLimit}</span>
                </div>
            ),
        },
        {
            title: 'Next reset',
            value: moment(resetDate).fromNow(),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-2">
                <div className="divide-border flex w-full flex-col gap-1 divide-y">
                    {info.map(item => (
                        <div key={item.title} className="flex flex-row justify-between gap-1 py-4">
                            <span className="text-muted-foreground text-sm">{item.title}</span>
                            <span className="text-sm font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
