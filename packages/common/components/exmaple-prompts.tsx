import { useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui';
import {
    IconBook,
    IconBulb,
    IconChartBar,
    IconPencil,
    IconQuestionMark,
} from '@tabler/icons-react';
import { Editor } from '@tiptap/react';

export const examplePrompts = {
    howTo: [
        'How to plan a sustainable vegetable garden for small spaces?',
        'How to prepare for your first international travel experience?',
        'How to set up a personal budget that actually works?',
        'How to improve your public speaking skills for professional settings?',
    ],

    explainConcepts: [
        'Explain how blockchain technology works in simple terms.',
        'What is quantum computing and how does it differ from traditional computing?',
        'Explain the concept of emotional intelligence and its importance.',
        'How does carbon capture technology work to combat climate change?',
    ],

    creative: [
        "Write a short story about a chance encounter that changes someone's life.",
        'Create a recipe for a fusion dish combining Italian and Japanese cuisines.',
        'Design a fictional sustainable city of the future.',
        'Develop a character profile for the protagonist of a science fiction novel.',
    ],

    advice: [
        "What's the best approach to negotiate a salary increase?",
        'How should I prepare for a marathon as a beginner runner?',
        'What strategies can help manage work-life balance when working remotely?',
        'What should I consider when adopting a pet for the first time?',
    ],

    analysis: [
        'Analyze the potential impact of artificial intelligence on healthcare.',
        'Compare different approaches to addressing climate change.',
        'Examine the pros and cons of various renewable energy sources.',
        'Analyze how social media has transformed communication in the past decade.',
    ],
};

export const getRandomPrompt = (category?: keyof typeof examplePrompts) => {
    if (category && examplePrompts[category]) {
        const prompts = examplePrompts[category];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }

    // If no category specified or invalid category, return a random prompt from any category
    const categories = Object.keys(examplePrompts) as Array<keyof typeof examplePrompts>;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const prompts = examplePrompts[randomCategory];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

// Map of category to icon component
const categoryIcons = {
    howTo: { name: 'How to', icon: IconQuestionMark, color: '!text-yellow-700' },
    explainConcepts: { name: 'Explain Concepts', icon: IconBulb, color: '!text-blue-700' },
    creative: { name: 'Creative', icon: IconPencil, color: '!text-green-700' },
    advice: { name: 'Advice', icon: IconBook, color: '!text-purple-700' },
    analysis: { name: 'Analysis', icon: IconChartBar, color: '!text-red-700' },
};

export const ExamplePrompts = () => {
    const editor: Editor | undefined = useChatStore(state => state.editor);
    const handleCategoryClick = (category: keyof typeof examplePrompts) => {
        console.log('editor', editor);
        if (!editor) return;
        const randomPrompt = getRandomPrompt(category);
        editor.commands.clearContent();
        editor.commands.insertContent(randomPrompt);
    };

    if (!editor) return null;

    return (
        <div className="animate-fade-in mb-8 flex w-full flex-wrap justify-center gap-2 p-6 duration-[1000ms]">
            {Object.entries(categoryIcons).map(([category, value], index) => (
                <Button
                    key={index}
                    variant="bordered"
                    rounded="xl"
                    size="sm"
                    className="border-hard"
                    onClick={() => handleCategoryClick(category as keyof typeof examplePrompts)}
                >
                    <value.icon size={16} className={'text-muted-foreground'} />
                    {value.name}
                </Button>
            ))}
        </div>
    );
};
