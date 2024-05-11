import { ChatContext } from "./context";
export type TChatProvider = {
  children: React.ReactNode;
};

export const ChatProvider = ({ children }: TChatProvider) => {
  return (
    <ChatContext.Provider value={{ chatSession: [] }}>
      {children}
    </ChatContext.Provider>
  );
};
