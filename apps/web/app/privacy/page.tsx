import { Footer, MarkdownContent } from '@repo/common/components';
import { privacyPolicy } from '@repo/shared/config';

export default function PrivacyPage() {
    return (
        <div className="mx-auto flex max-w-screen-md flex-col gap-16 px-4 py-8">
            <MarkdownContent content={privacyPolicy} />
            <Footer />
        </div>
    );
}
