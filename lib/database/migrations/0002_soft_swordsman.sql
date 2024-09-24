CREATE TABLE IF NOT EXISTS "custom_assistants" (
	"name" text NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"icon_url" text,
	"key" text PRIMARY KEY NOT NULL,
	"start_message" json,
	CONSTRAINT "custom_assistants_key_unique" UNIQUE("key")
);
