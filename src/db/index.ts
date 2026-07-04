import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { relations } from "./schema";

const client = neon(process.env.NEON_DATABASE_URL!);

export const db = drizzle({ client, relations });
