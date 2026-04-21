import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { agents } from "../packages/db/src/schema/agents.js";
import { eq } from "drizzle-orm";
import fs from "fs/promises";

async function run() {
  const { Client } = pg;
  const client = new Client({ connectionString: process.env.DATABASE_URL || "postgres://localhost:54329/paperclip" });
  await client.connect();
  const db = drizzle(client);

  const ceoText = await fs.readFile("server/src/onboarding-assets/ceo/AGENTS.md", "utf8");
  await db.update(agents).set({ instructionsFilePath: ceoText }).where(eq(agents.role, "ceo"));
  
  const ctoText = await fs.readFile("server/src/onboarding-assets/cto/AGENTS.md", "utf8");
  await db.update(agents).set({ instructionsFilePath: ctoText }).where(eq(agents.role, "cto"));

  console.log("Updated CEO and CTO instructions in the DB!");
  await client.end();
}
run().catch(console.error);
