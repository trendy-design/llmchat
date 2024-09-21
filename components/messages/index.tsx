import { PreviousMessages } from "./previous-messages";
import { RecentMessage } from "./recent-message";

export const ChatMessages = () => {
  return (
    <div
      className="flex h-[100dvh] w-full flex-col items-center overflow-y-auto pb-[200px] pt-[60px]"
      id="chat-container"
    >
      <div className="flex w-full translate-x-0 flex-col items-start px-4 pt-4 md:w-[600px] md:-translate-x-4 lg:w-[680px]">
        <PreviousMessages />
        <RecentMessage />
      </div>
    </div>
  );
};
