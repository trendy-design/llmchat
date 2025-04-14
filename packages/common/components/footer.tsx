import Link from 'next/link';

export const Footer = () => {
    const links = [
        {
            href: 'https://git.new/llmchat',
            label: 'Star us on GitHub',
        },
        {
            href: 'https://github.com',
            label: 'Changelog',
        },
        {
            href: '',
            label: 'Feedback',
        },
        {
            href: '/terms',
            label: 'Terms',
        },
        {
            href: '/privacy',
            label: 'Privacy',
        },
    ];
    return (
        <div className="flex w-full flex-row items-center justify-center gap-4 p-3">
            {links.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground text-xs opacity-50 hover:opacity-100"
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
};
