import { ExplainationCard } from './explaination-card';

export const PrivacyCopy = () => {
  return (
    <>
      We&apos;re{' '}
      <a
        href="/privacy"
        className="cursor-pointer underline decoration-stone-500/50 underline-offset-4"
      >
        privacy-first
      </a>
      . Your conversations are securely stored{' '}
      <ExplainationCard explanation="We don't store your data on our server. All your data is stored locally in browser's in built database called IndexDB.">
        <a
          href="/privacy"
          className="cursor-pointer underline decoration-stone-500/50 underline-offset-4"
        >
          locally
        </a>
      </ExplainationCard>{' '}
      and deletable anytime.
    </>
  );
};
