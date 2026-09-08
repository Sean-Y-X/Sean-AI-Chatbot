-- Existing values are UTC wall-clock: `now()` ran under the database's GMT
-- session timezone, and application writes went in as `toISOString()`, whose
-- trailing `Z` a `timestamp without time zone` column discards. Reads were the
-- broken half — the driver parses oid 1114 in the Node process's local zone, so
-- timestamps shifted by the server's UTC offset.
--
-- `AT TIME ZONE 'UTC'` is spelled out rather than drizzle-kit's generated
-- `::timestamptz`, which would instead resolve against whatever `TimeZone` the
-- session happens to carry when this runs.
ALTER TABLE "conversations"
	ALTER COLUMN "last_message_at" SET DATA TYPE timestamp with time zone USING "last_message_at" AT TIME ZONE 'UTC',
	ALTER COLUMN "read_at" SET DATA TYPE timestamp with time zone USING "read_at" AT TIME ZONE 'UTC',
	ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "messages"
	ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';
