import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "omegaelz-crm-secret-key-2026";

function generateToken(user: any) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["admin", "manager", "sales", "support"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if username already exists
      const existing = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Username already exists");
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      const result = await db.insert(localUsers).values({
        username: input.username,
        passwordHash,
        name: input.name ?? input.username,
        email: input.email,
        role: input.role ?? "sales",
      });

      const user = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, Number(result[0].insertId)))
        .limit(1);

      const token = generateToken(user[0]);

      return {
        token,
        user: {
          id: user[0].id,
          username: user[0].username,
          name: user[0].name,
          email: user[0].email,
          role: user[0].role,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const users = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (users.length === 0) {
        throw new Error("Invalid username or password");
      }

      const user = users[0];
      const valid = await bcrypt.compare(input.password, user.passwordHash);

      if (!valid) {
        throw new Error("Invalid username or password");
      }

      const token = generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    // Check for local auth token in headers
    const authHeader = ctx.req.headers.get("x-local-auth-token");
    if (!authHeader) return null;

    try {
      const decoded = jwt.verify(authHeader, JWT_SECRET) as any;
      const db = getDb();
      const users = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, decoded.id))
        .limit(1);

      if (users.length === 0) return null;

      const user = users[0];
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        isActive: user.isActive,
      };
    } catch {
      return null;
    }
  }),
});
