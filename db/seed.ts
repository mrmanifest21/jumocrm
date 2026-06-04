// @ts-nocheck
import { getDb } from "../api/queries/connection";
import { localUsers, messages } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();
  console.log("Seeding OmegaElz CRM...");

  // Check if admin1 already exists
  const existing = await db.select().from(localUsers).where(sql`username = 'admin1'`).limit(1);
  if (existing.length === 0) {
    // Create admin1
    const hash1 = await bcrypt.hash("admin123", 10);
    await db.insert(localUsers).values({
      username: "admin1",
      passwordHash: hash1,
      name: "Daniel Menji",
      email: "daniel@omegaelz.co.za",
      role: "admin",
      department: "Management",
      isActive: true,
    });
    console.log("Created admin1 (daniel/admin123)");

    // Create admin2
    const hash2 = await bcrypt.hash("admin456", 10);
    await db.insert(localUsers).values({
      username: "admin2",
      passwordHash: hash2,
      name: "Temosho",
      email: "temosho@omegaelz.co.za",
      role: "admin",
      department: "Management",
      isActive: true,
    });
    console.log("Created admin2 (temosho/admin456)");
  } else {
    console.log("Admin accounts already exist");
  }

  // Seed sample messages between admins
  const admin1 = await db.select().from(localUsers).where(sql`username = 'admin1'`).limit(1);
  const admin2 = await db.select().from(localUsers).where(sql`username = 'admin2'`).limit(1);

  if (admin1.length > 0 && admin2.length > 0) {
    const existingMsgs = await db.select({ count: sql`count(*)` }).from(messages);
    if (existingMsgs[0].count === 0) {
      await db.insert(messages).values([
        {
          senderId: admin1[0].id,
          senderName: "Daniel Menji",
          recipientId: admin2[0].id,
          subject: "Welcome to OmegaElz CRM",
          body: "Hi Temosho,\n\nThe CRM is now live! We can use this to manage all our clients, projects, and deals.\n\nLet me know if you need any help getting started.\n\n- Daniel",
          isRead: false,
        },
        {
          senderId: admin2[0].id,
          senderName: "Temosho",
          recipientId: admin1[0].id,
          subject: "RE: Welcome to OmegaElz CRM",
          body: "Hi Daniel,\n\nThanks for setting this up! It looks great. I'll start adding our active deals and updating the pipeline.\n\n- Temosho",
          isRead: false,
        },
      ]);
      console.log("Seeded 2 sample messages");
    }
  }

  console.log("Seeding complete!");
}

import { sql } from "drizzle-orm";

seed().catch(console.error);
