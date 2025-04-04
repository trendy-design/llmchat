import Link from 'next/link';

export const Footer = () => {
    const links = [
        {
            href: 'https://github.com',
            label: 'Star us on GitHub',
        },
        {
            href: 'https://github.com',
            label: 'Changelog',
        },
        {
            href: 'https://github.com',
            label: 'Feedback',
        },
        {
            href: 'https://github.com',
            label: 'Terms',
        },
        {
            href: 'https://github.com',
            label: 'Privacy',
        },
    ];
    return (
        <div className="flex w-full flex-row items-center justify-center gap-4 p-4">
            {links.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground text-xs opacity-80 hover:opacity-100"
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
};
