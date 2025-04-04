import { useAgentStream } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { ThreadItem } from '@repo/shared/types';
import { Button, RadioGroup, RadioGroupItem, Textarea } from '@repo/ui';
import { IconCheck, IconQuestionMark, IconSquare } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

export const QuestionPrompt = ({ threadItem }: { threadItem: ThreadItem }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [customOption, setCustomOption] = useState<string>('');
    const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
    const { handleSubmit } = useAgentStream();
    const getThreadItems = useChatStore(state => state.getThreadItems);
    const updateThreadItem = useChatStore(state => state.updateThreadItem);

    const options: string[] = threadItem.object?.clarifyingQuestion?.options || [];
    const question = threadItem.object?.clarifyingQuestion?.question || '';
    const choiceType = threadItem.object?.clarifyingQuestion?.choiceType || 'multiple';
    const isSubmitted = !!threadItem.object?.clarifyingQuestion?.submittedQuery;

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        setIsCustomSelected(value === 'custom');
    };

    const hasClarifyingQuestions = useMemo(() => {
        return threadItem.object?.clarifyingQuestion;
    }, [threadItem.object]);

    const renderRadioGroup = () => {
        return (
            <RadioGroup
                value={selectedOption || ''}
                onValueChange={handleOptionChange}
                className="flex flex-col gap-2"
            >
                {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <p className="text-sm">{option}</p>
                    </div>
                ))}

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="option-custom" />
                    <p className="text-sm">Custom option</p>
                </div>
            </RadioGroup>
        );
    };

    const renderCheckboxGroup = () => {
        return (
            <div className="flex flex-row flex-wrap gap-2">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className="border-border flex items-center space-x-2 rounded-full border px-3 py-1.5"
                        onClick={() => {
                            if (selectedOptions.includes(option)) {
                                setSelectedOptions(selectedOptions.filter(o => o !== option));
                            } else {
                                setSelectedOptions([...selectedOptions, option]);
                            }
                        }}
                    >
                        {selectedOptions.includes(option) ? (
                            <IconCheck size={16} strokeWidth={2} className="text-brand" />
                        ) : (
                            <IconSquare
                                size={16}
                                strokeWidth={2}
                                className="text-muted-foreground/20"
                            />
                        )}
                        <p className="text-sm">{option}</p>
                    </div>
                ))}
            </div>
        );
    };

    if (isSubmitted) {
        return (
            <div className="border-border bg-background mt-2 flex w-full flex-col flex-col items-start gap-4 rounded-2xl border p-4">
                <span className="flex flex-row items-center gap-1 text-xs font-medium text-emerald-600">
                    <IconCheck size={14} strokeWidth={2} /> Submitted
                </span>
                <div className="flex flex-col">
                    <p className="text-base">{threadItem.object?.submittedQuery}</p>
                </div>
            </div>
        );
    }

    if (!hasClarifyingQuestions) {
        return null;
    }

    return (
        <div className="border-border bg-background mt-2 flex w-full flex-col items-start gap-4 rounded-2xl border p-4">
            <div className="flex flex-row items-center gap-1">
                <IconQuestionMark size={16} strokeWidth={2} className="text-brand" />
                <p className="text-muted-foreground text-sm">Follow up Question</p>
            </div>

            <p className="text-base">{question}</p>

            {choiceType === 'single' ? renderRadioGroup() : renderCheckboxGroup()}

            <div className="mt-2 w-full">
                <Textarea
                    value={customOption}
                    onChange={e => setCustomOption(e.target.value)}
                    placeholder="Enter additional feedback"
                    className="!border-border h-[100px] w-full rounded-lg !border px-3 py-2"
                />
            </div>

            <Button
                disabled={!selectedOption && !selectedOptions.length && !customOption}
                size="sm"
                rounded="full"
                onClick={async () => {
                    let query = '';
                    if (choiceType === 'single') {
                        query = `${selectedOption ? `${selectedOption} \n\n` : ''}${customOption}`;
                    } else {
                        query = `${!!selectedOptions?.length ? `${selectedOptions.join(', ')} \n\n` : ''}${customOption}`;
                    }
                    const formData = new FormData();
                    formData.append('query', query);
                    const threadItems = await getThreadItems(threadItem.threadId);
                    updateThreadItem(threadItem.threadId, {
                        ...threadItem,
                        object: {
                            ...threadItem.object,
                            clarifyingQuestion: {
                                ...threadItem.object?.clarifyingQuestion,
                                submittedQuery: query,
                            },
                        },
                        status: 'COMPLETED',
                    });
                    setTimeout(() => {
                        handleSubmit({
                            formData,
                            messages: threadItems,
                        });
                    }, 1000);
                }}
            >
                Submit
            </Button>
        </div>
    );
};
