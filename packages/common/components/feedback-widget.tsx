import { useAuth } from '@clerk/nextjs';
import { Button, Textarea } from '@repo/ui';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useRef, useState } from 'react';

export type FeedbackWidgetProps = {
    onClose: () => void;
};

export const FeedbackWidget = ({ onClose }: FeedbackWidgetProps) => {
    const { userId } = useAuth();
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async () => {
        if (!feedback.trim()) return;

        setIsSubmitting(true);

        try {
            await fetch('/api/feedback', {
                method: 'POST',
                body: JSON.stringify({ feedback }),
            });
            setIsSuccess(true);
            setFeedback('');

            setTimeout(() => {
                setIsSuccess(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!userId) {
        return null;
    }

    return (
        <div className="flex flex-col items-end justify-end">
            {!isSuccess ? (
                <>
                    <div className="flex w-full flex-row justify-between px-4 pt-4">
                        <p className="text-sm font-medium">Help us improve</p>
                    </div>
                    <Textarea
                        placeholder="Share your thoughts or suggestions to help us improve."
                        value={feedback}
                        className="placeholder:text-muted-foreground/50 border-none bg-transparent px-4 py-2"
                        onChange={e => setFeedback(e.target.value)}
                        ref={inputRef}
                    />
                    <div className="flex w-full flex-row justify-start gap-2 px-4 pb-4">
                        <Button
                            variant="default"
                            size="xs"
                            disabled={isSubmitting || !feedback.trim()}
                            rounded="full"
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Feedback'}
                        </Button>
                        <Button variant="secondary" size="xs" rounded="full" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex w-full flex-row gap-3 p-4">
                    <div className="flex flex-col items-center justify-center">
                        <IconCircleCheckFilled size={24} strokeWidth={2} className="text-brand" />
                    </div>
                    <div className="flex flex-col gap-0">
                        <p className="text-sm font-medium">Thank you!</p>
                        <p className="text-muted-foreground/50 text-sm">
                            Your feedback has been sent.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
