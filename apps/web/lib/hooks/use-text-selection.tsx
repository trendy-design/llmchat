import { useEffect, useState } from 'react';

export const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [showPopup, setShowPopup] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();

      if (selection && selection?.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        var parentDiv = document.getElementById('chat-container');
        if (parentDiv?.contains(range.commonAncestorContainer)) {
          const selectedText = range.toString().trim();
          if (selectedText) {
            setSelectedText(selectedText);
            setShowPopup(true);
          } else {
            setShowPopup(false);
          }
        }
      } else {
        setShowPopup(false);
      }
    };

    const chatContainer = document.getElementById('chat-container');

    if (!chatContainer) {
      return;
    }

    document.addEventListener('selectionchange', handleMouseUp);

    return () => {
      chatContainer.removeEventListener('selectionchange', handleMouseUp);
    };
  }, [showPopup]);

  const handleClearSelection = () => {
    setShowPopup(false);
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  };

  return { selectedText, showPopup, handleClearSelection };
};
