"use client";

import { Type } from "@repo/ui";
import * as Sentry from "@sentry/nextjs";
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    // biome-ignore lint/a11y/useHtmlLang: <explanation>
<html>
      <body>
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-25">
          <div className="flex w-[300px] flex-col gap-2">
            <Type size="base">Oops! Something went wrong.</Type>
            <Type size="sm" textColor="secondary">
              It seems we encountered an unexpected error. Please try refreshing
              the page or check back later. If the problem persists, feel free
              to <a href="mailto:hello@llmchat.com">contact team</a>.
            </Type>
          </div>
        </div>
      </body>
    </html>
  );
}
