import Link from 'next/link';
import { cn } from '../lib/utils';
import { Flex } from './flex';
import { Type } from './text';

export type TFormLabel = {
    children?: React.ReactNode;
    className?: string;
    link?: string;
    linkText?: string;
    label: string;
    extra?: () => React.ReactNode;
    isOptional?: boolean;
};
export const FormLabel = ({
    children,
    label,
    extra,
    isOptional,
    className,
    linkText,
    link,
}: TFormLabel) => {
    return (
        <Flex direction="col" gap="none" items="start" className={cn('w-full', className)}>
            <Flex items="center" gap="sm" className="w-full">
                <Flex items="center" gap="xs">
                    <Type size="sm" weight="medium">
                        {label}
                    </Type>
                    {isOptional && (
                        <Type size="xs" textColor="secondary">
                            (Optional)
                        </Type>
                    )}
                </Flex>
                {link && (
                    <Link
                        href={link}
                        target="_blank"
                        className="decoration-brand/20 py-0.5 text-sm font-medium text-violet-500 underline underline-offset-4 hover:opacity-90"
                    >
                        {linkText}
                    </Link>
                )}
                {extra && extra()}
            </Flex>
            {children && (
                <Type size="xs" textColor="secondary">
                    {children}
                </Type>
            )}
        </Flex>
    );
};
