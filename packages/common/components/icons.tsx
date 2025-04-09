import { cn } from '@repo/ui';
import { IconBoltFilled, IconCodeDots, IconSpiral, IconTools } from '@tabler/icons-react';

export const ToolIcon = ({ className }: { className?: string }) => {
    return (
        <div
            className={`flex size-5 items-center justify-center rounded-md border border-yellow-900 bg-yellow-800 p-0.5 ${className}`}
        >
            <IconTools size={20} strokeWidth={2} className="text-yellow-400" />
        </div>
    );
};

export const ToolResultIcon = () => {
    return (
        <div className="flex size-5 items-center justify-center rounded-md border border-yellow-900 bg-yellow-800 p-0.5">
            <IconCodeDots size={20} strokeWidth={2} className="text-yellow-400" />
        </div>
    );
};

export const DeepResearchIcon = () => {
    return <IconSpiral size={20} strokeWidth={2} className="text-muted-foreground" />;
};

export const BYOKIcon = () => {
    return (
        <div className="flex-inline flex h-5 items-center justify-center gap-1 rounded-md bg-purple-500/20 p-0.5 px-1 font-mono text-xs font-medium text-purple-600">
            BYOK
        </div>
    );
};

export const NewIcon = () => {
    return (
        <div className="flex-inline flex h-5 items-center justify-center gap-1 rounded-md bg-purple-500/20 p-0.5 px-1 font-mono text-xs font-medium text-purple-500">
            New
        </div>
    );
};

export const CreditIcon = ({
    credits,
    variant = 'default',
}: {
    credits: number;
    variant?: 'default' | 'muted';
}) => {
    return (
        <div
            className={cn(
                'flex-inline text-muted-foreground flex h-5 items-center justify-center gap-0.5 rounded-md border border-none font-mono text-xs font-medium opacity-50',
                variant === 'muted' && 'border-none'
            )}
        >
            <IconBoltFilled size={14} strokeWidth={2} className="text-muted-foreground" /> {credits}
        </div>
    );
};
