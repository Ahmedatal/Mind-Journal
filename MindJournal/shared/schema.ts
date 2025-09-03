import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title"),
  content: text("content").notNull(),
  mood: varchar("mood"), // happy, content, neutral, sad, stressed
  sentimentScore: real("sentiment_score"), // 1-5 rating
  sentimentConfidence: real("sentiment_confidence"), // 0-1
  themes: text("themes").array(), // extracted themes like work, family, etc
  tags: text("tags").array(), // user-added tags
  wordCount: integer("word_count").default(0),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiPrompts = pgTable("ai_prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  prompt: text("prompt").notNull(),
  context: text("context"), // context that influenced the prompt
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'pattern', 'correlation', 'trend', etc.
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  data: jsonb("data"), // structured insight data
  confidence: real("confidence"), // 0-1
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  viewed: boolean("viewed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertJournalEntry = typeof journalEntries.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;

export type InsertAiPrompt = typeof aiPrompts.$inferInsert;
export type AiPrompt = typeof aiPrompts.$inferSelect;

export type InsertInsight = typeof insights.$inferInsert;
export type Insight = typeof insights.$inferSelect;

// Insert schemas
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiPromptSchema = createInsertSchema(aiPrompts).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertJournalEntryInput = z.infer<typeof insertJournalEntrySchema>;
export type InsertAiPromptInput = z.infer<typeof insertAiPromptSchema>;
