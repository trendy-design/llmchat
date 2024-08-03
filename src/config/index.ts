import { models } from "@/types";
import { docs } from "./docs";
import { examplePrompts } from "./example-prompts";
import { links } from "./links";
import { defaultPreferences } from "./preferences";
import * as prompts from "./prompts";

const configs = {
  ...links,
  ...prompts,
  ollamaTagsEndpoint: "/api/tags",
  heroVideo:
    "https://zyqdiwxgffuy8ymd.public.blob.vercel-storage.com/llmchat01-ZnJThnp8q3Ff404KEvwmrSi55jYCbg.mp4",
};

export { configs, defaultPreferences, docs, examplePrompts, models };
