import { PreviousMessages } from "./previous-messages";
import { RecentMessage } from "./recent-message";

export const ChatMessages = () => {
  return (
    <div
      className="flex h-[100dvh] w-full flex-col items-center overflow-y-auto pb-[200px] pt-[60px]"
      id="chat-container"
    >
      <div className="flex w-full flex-1 flex-col gap-24 p-2 md:w-[700px] lg:w-[720px]">
        <div className="flex w-full flex-col items-start gap-8">
          <PreviousMessages />
          <RecentMessage />
        </div>
      </div>
    </div>
  );
};
