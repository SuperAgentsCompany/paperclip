import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { agents } from "./packages/db/src/schema/agents.js";
import { companySkills } from "./packages/db/src/schema/company-skills.js";

async function run() {
  const { Client } = pg;
  const client = new Client({ connectionString: process.env.DATABASE_URL || "postgres://localhost:54329/paperclip" });
  await client.connect();
  const db = drizzle(client);

  const allAgents = await db.select().from(agents);
  console.log("Agents:", JSON.stringify(allAgents, null, 2));

  const skills = await db.select().from(companySkills);
  console.log("Skills:", JSON.stringify(skills, null, 2));
  
  await client.end();
}
run().catch(console.error);