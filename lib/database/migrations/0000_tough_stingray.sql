DO $$ BEGIN
 CREATE TYPE "public"."assistant_type" AS ENUM('base', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dalle_image_quality" AS ENUM('standard', 'hd');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dalle_image_size" AS ENUM('1024x1024', '1792x1024', '1024x1792');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."provider" AS ENUM('llmchat', 'openai', 'anthropic', 'gemini', 'ollama', 'groq');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."stop_reason" AS ENUM('error', 'cancel', 'apikey', 'recursion', 'rateLimit', 'unauthorized', 'finish');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."web_search_engine" AS ENUM('google', 'duckduckgo');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"provider" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assistants" (
	"name" text NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"icon_url" text,
	"provider" "provider" NOT NULL,
	"base_model" text NOT NULL,
	"key" text PRIMARY KEY NOT NULL,
	"type" "assistant_type" NOT NULL,
	CONSTRAINT "assistants_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text,
	"parent_id" text,
	"image" text,
	"raw_human" text,
	"raw_ai" text,
	"is_loading" boolean DEFAULT false,
	"stop" boolean DEFAULT false,
	"stop_reason" "stop_reason",
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"run_config" json NOT NULL,
	"tools" json,
	"related_questions" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preferences" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"default_assistant" text NOT NULL,
	"system_prompt" text NOT NULL,
	"message_limit" integer NOT NULL,
	"temperature" numeric NOT NULL,
	"memories" json NOT NULL,
	"suggest_related_questions" boolean NOT NULL,
	"generate_title" boolean NOT NULL,
	"default_plugins" json NOT NULL,
	"whisper_speech_to_text_enabled" boolean NOT NULL,
	"dalle_image_quality" "dalle_image_quality" NOT NULL,
	"dalle_image_size" "dalle_image_size" NOT NULL,
	"max_tokens" integer NOT NULL,
	"default_web_search_engine" "web_search_engine" NOT NULL,
	"ollama_base_url" text NOT NULL,
	"top_p" numeric NOT NULL,
	"top_k" numeric NOT NULL,
	"google_search_engine_id" text,
	"google_search_api_key" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prompts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
