import { useChatStore } from '@/libs/store/chat.store';
import { Input } from '@repo/ui';
import { FC, useEffect, useRef } from 'react';

export type THistoryEdit = {
  title?: string;
  threadId: string;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  setIsEditing: (isEditing: boolean) => void;
};
export const HistoryEdit: FC<THistoryEdit> = ({
  title,
  threadId,
  isEditing,
  setIsEditing,
  onTitleChange,
}) => {
  const updateThread = useChatStore(state => state.updateThread);
  const historyInputRef = useRef<HTMLInputElement>(null);

  const handleInputBlur = () => {
    setIsEditing(false);
    updateThread({
      id: threadId,
      title: title?.trim() || 'Untitled',
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      updateThread({
        id: threadId,
        title: title?.trim() || 'Untitled',
      });
    }
  };

  useEffect(() => {
    if (isEditing) {
      historyInputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <Input
      variant="ghost"
      className="h-6 text-sm"
      ref={historyInputRef}
      value={title}
      onChange={e => onTitleChange(e.target.value)}
      onKeyDown={handleInputKeyDown}
      onBlur={handleInputBlur}
    />
  );
};
