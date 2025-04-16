import { cn } from '@repo/ui';
import { IconBoltFilled, IconSpiral, IconTools } from '@tabler/icons-react';

export const ToolIcon = ({ className }: { className?: string }) => {
    return (
        <div
            className={`bg-brand flex size-5 items-center justify-center  rounded-md p-0.5 ${className}`}
        >
            <IconTools size={14} strokeWidth={2} className="text-background" />
        </div>
    );
};

export const ToolResultIcon = () => {
    return (
        <div className="flex-inline flex h-5 items-center justify-center gap-1 rounded-md bg-blue-500/20 p-0.5 px-1 font-mono text-xs font-semibold text-blue-600">
            Result
        </div>
    );
};

export const DeepResearchIcon = () => {
    return <IconSpiral size={20} strokeWidth={2} className="text-muted-foreground" />;
};

export const BYOKIcon = () => {
    return (
        <div className="flex-inline flex h-5 items-center justify-center gap-1 rounded-md bg-emerald-500/20 p-0.5 px-1 font-mono text-xs font-medium text-emerald-600">
            BYOK
        </div>
    );
};

export const ToolCallIcon = () => {
    return (
        <div className="flex-inline flex h-5 items-center justify-center gap-1 rounded-md bg-blue-500/20 p-0.5 px-1 font-mono text-xs font-semibold text-blue-600">
            Tool
        </div>
    );
};

export const NewIcon = () => {
    return (
        <div className="flex-inline flex h-5 items-center justify-center gap-1 rounded-md bg-emerald-500/20 p-0.5 px-1 font-mono text-xs font-medium text-emerald-500">
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
