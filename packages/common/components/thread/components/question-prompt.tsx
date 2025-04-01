import { useAgentStream } from '@repo/common/hooks';
import { Answer, ThreadItem, useChatStore } from '@repo/common/store';
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

    const options: string[] = threadItem.answer?.object?.clarifyingQuestion?.options || [];
    const question = threadItem.answer?.object?.clarifyingQuestion?.question || '';
    const type = threadItem.answer?.object?.clarifyingQuestion?.type || 'single';
    const isSubmitted = !!threadItem.answer?.object?.submittedQuery;

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        setIsCustomSelected(value === 'custom');
    };

    const hasClarifyingQuestions = useMemo(() => {
        return (
            threadItem.answer?.object?.clarifyingQuestion &&
            threadItem.answer?.objectType === 'clarifyingQuestions'
        );
    }, [threadItem.answer]);

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
                    <p className="text-base">{threadItem.answer?.object?.submittedQuery}</p>
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

            {type === 'single' ? renderRadioGroup() : renderCheckboxGroup()}

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
                    if (type === 'single') {
                        query = `${selectedOption} \n\n ${customOption}`;
                    } else {
                        query = `${selectedOptions.join(', ')} \n\n ${customOption}`;
                    }
                    const formData = new FormData();
                    formData.append('query', query);
                    const threadItems = await getThreadItems(threadItem.threadId);
                    updateThreadItem(threadItem.threadId, {
                        ...threadItem,
                        query,
                        answer: {
                            ...threadItem.answer,
                            object: {
                                ...threadItem.answer?.object,
                                submittedQuery: query,
                            },
                        } as Answer,
                        status: 'COMPLETED',
                    });
                    setTimeout(() => {
                        handleSubmit({
                            formData,
                            messages: threadItems,
                        });
                    }, 2000);
                }}
            >
                Submit
            </Button>
        </div>
    );
};
