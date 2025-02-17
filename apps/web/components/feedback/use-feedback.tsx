import { useState } from 'react';
import { FeedbackModal } from './feedback-modal';

export const useFeedback = () => {
  const [open, setOpen] = useState(false);

  const renderModal = () => {
    return <FeedbackModal open={open} onOpenChange={setOpen} />;
  };

  return { open, setOpen, renderModal };
};
