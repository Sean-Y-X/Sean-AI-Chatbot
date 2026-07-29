ALTER TABLE "conversations" ADD COLUMN "last_message_at" timestamp;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "read_at" timestamp;--> statement-breakpoint
CREATE INDEX "conversations_last_message_at_idx" ON "conversations" ("last_message_at" desc);--> statement-breakpoint
UPDATE "conversations" c SET "last_message_at" = (
	SELECT max(m."created_at") FROM "messages" m WHERE m."conversation_id" = c."id"
);