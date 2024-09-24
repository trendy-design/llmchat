ALTER TABLE "chat_sessions" ADD COLUMN "is_example" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "custom_assistant" json;