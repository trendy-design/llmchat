import { Spinner } from "./ui";

export const FullPageLoader = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner />
    </div>
  );
};
