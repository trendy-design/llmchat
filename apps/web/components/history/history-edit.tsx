import { useSessions } from '@/lib/context';
import { TChatSession } from '@repo/shared/types';
import { Input } from '@repo/ui';
import { FC, useEffect, useRef } from 'react';

export type THistoryEdit = {
  title?: string;
  session: TChatSession;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  setIsEditing: (isEditing: boolean) => void;
};
export const HistoryEdit: FC<THistoryEdit> = ({
  title,
  session,
  isEditing,
  setIsEditing,
  onTitleChange,
}) => {
  const { updateSessionMutation } = useSessions();
  const historyInputRef = useRef<HTMLInputElement>(null);

  const handleInputBlur = () => {
    setIsEditing(false);
    updateSessionMutation.mutate({
      sessionId: session.id,
      session: { title: title?.trim() || session?.title || 'Untitled' },
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      updateSessionMutation.mutate({
        sessionId: session.id,
        session: { title: title?.trim() || session?.title || 'Untitled' },
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
      onChange={(e) => onTitleChange(e.target.value)}
      onKeyDown={handleInputKeyDown}
      onBlur={handleInputBlur}
    />
  );
};
