import { useEffect, useState } from "react";

interface UseTextSelectionPopup {
  selectedText: string;
  showPopup: boolean;
}

export const useTextSelection = (): UseTextSelectionPopup => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection) {
        const selectedText = selection.toString().trim();

        if (selectedText) {
          setSelectedText(selectedText);
          setShowPopup(true);
        } else {
          setShowPopup(false);
        }
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      setShowPopup(false);
    };

    const chatContainer = document.getElementById("chat-container");

    if (!chatContainer) {
      return;
    }
    chatContainer.addEventListener("mouseup", handleMouseUp);
    chatContainer.addEventListener("mousedown", handleMouseDown);

    return () => {
      chatContainer.removeEventListener("mouseup", handleMouseUp);
      chatContainer.removeEventListener("mousedown", handleMouseDown);
    };
  }, [showPopup]);

  return { selectedText, showPopup };
};
