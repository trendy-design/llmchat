import { PreviousMessages } from "./previous-messages";
import { RecentMessage } from "./recent-message";

export const ChatMessages = () => {
  return (
    <div
      className="flex h-[100dvh] w-full flex-col items-center overflow-y-auto pb-[200px] pt-[60px]"
      id="chat-container"
    >
      <div className="flex w-full flex-1 flex-col gap-24 p-2 md:w-[640px] lg:w-[700px]">
        <div className="flex w-full flex-col items-start px-4">
          {/* <WelcomeMessage show={true} /> */}
          <PreviousMessages />
          <RecentMessage />
        </div>
      </div>
    </div>
  );
};
