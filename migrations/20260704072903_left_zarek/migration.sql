CREATE TYPE "message_role" AS ENUM('user', 'ai');--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "role" "message_role" DEFAULT 'user'::"message_role" NOT NULL;