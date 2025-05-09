import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Dialog,
    DialogContent,
} from '@repo/ui';
import { useAppStore } from '../../store/app.store';

export type FaqItem = {
    question: string;
    answer: string;
};

const faqItems: FaqItem[] = [
    {
        question: 'What is LLMChat?',
        answer: 'LLMChat is a private, open-source chat platform supporting all major model providers and advanced research features.',
    },
    {
        question: 'Is my data private?',
        answer: 'Yes, your data is never shared or sold. You can self-host for full control.',
    },
    {
        question: 'Can I use my own API key?',
        answer: 'Yes, you can bring your own key for unlimited chat and model access.',
    },
    {
        question: 'How do I give feedback?',
        answer: 'Use the feedback button in the sidebar to share your thoughts or report issues.',
    },
    {
        question: 'Where can I find the changelog?',
        answer: 'The changelog is available in the Help & Support section in the sidebar.',
    },
];

export const FaqDialog = () => {
    const { isFaqOpen, setIsFaqOpen } = useAppStore();

    return (
        <Dialog open={isFaqOpen} onOpenChange={setIsFaqOpen}>
            <DialogContent ariaTitle="Frequently Asked Questions" className="max-w-lg gap-0 p-0">
                <div className="flex items-center gap-2 border-b px-4 py-3">
                    <span className="text-base font-bold">Frequently Asked Questions</span>
                </div>
                <div className="flex flex-col px-6">
                    <Accordion type="multiple" defaultChecked className="w-full">
                        {faqItems.map((item, idx) => (
                            <AccordionItem value={item.question} key={idx} className="px-0">
                                <AccordionTrigger className="px-0 text-sm font-medium">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    );
};
