import Image from "next/image";
import { useFeedback } from "../feedback/use-feedback";

export const OpenSourceCopy = () => {
  const linkClass =
    "underline decoration-zinc-500 underline-offset-4 inline-block cursor-pointer";
  const { renderModal, setOpen: openFeedback } = useFeedback();

  return (
    <>
      We&apos;re shipping new features every week. Check out{" "}
      <a href="https://git.new/llmchat" className={linkClass}>
        what&apos;s coming
      </a>{" "}
      or{" "}
      <p className={linkClass} onClick={() => openFeedback(true)}>
        <Image
          src="/icons/handdrawn_love.svg"
          width={16}
          height={16}
          alt="Love icon"
          className="mx-1 inline-block dark:invert"
        />{" "}
        share your feedback
      </p>
      {renderModal()}
    </>
  );
};
