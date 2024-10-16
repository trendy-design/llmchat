ALTER TYPE "provider" ADD VALUE 'lmstudio';--> statement-breakpoint
ALTER TABLE "preferences" ADD COLUMN "lm_studio_base_url" text NOT NULL;