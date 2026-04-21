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

  const ceoText = await fs.readFile("src/onboarding-assets/ceo/AGENTS.md", "utf8");
  await db.update(agents).set({ instructionsFilePath: ceoText }).where(eq(agents.role, "ceo"));
  
  const ctoText = await fs.readFile("src/onboarding-assets/cto/AGENTS.md", "utf8");
  await db.update(agents).set({ instructionsFilePath: ctoText }).where(eq(agents.role, "cto"));

  const allAgents = await db.select({ id: agents.id, name: agents.name, role: agents.role }).from(agents);
  console.log("Agents after update:", JSON.stringify(allAgents, null, 2));

  await client.end();
}
run().catch(console.error);
