import {
  users,
  journalEntries,
  aiPrompts,
  insights,
  type User,
  type UpsertUser,
  type JournalEntry,
  type InsertJournalEntry,
  type AiPrompt,
  type InsertAiPrompt,
  type Insight,
  type InsertInsight,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Journal entry operations
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getUserJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]>;
  getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined>;
  updateJournalEntry(id: string, userId: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: string, userId: string): Promise<boolean>;
  searchJournalEntries(userId: string, query: string, themes?: string[]): Promise<JournalEntry[]>;
  
  // AI prompt operations
  createAiPrompt(prompt: InsertAiPrompt): Promise<AiPrompt>;
  getUnusedPrompt(userId: string): Promise<AiPrompt | undefined>;
  markPromptAsUsed(id: string): Promise<void>;
  
  // Insight operations
  createInsight(insight: InsertInsight): Promise<Insight>;
  getUserInsights(userId: string, limit?: number): Promise<Insight[]>;
  markInsightAsViewed(id: string): Promise<void>;
  
  // Analytics operations
  getUserStats(userId: string): Promise<{
    totalEntries: number;
    currentStreak: number;
    averageMood: number;
    weeklyInsights: number;
  }>;
  getMoodTrends(userId: string, days: number): Promise<{ date: string; mood: number }[]>;
  getThemeAnalysis(userId: string, days: number): Promise<{ theme: string; count: number; percentage: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Journal entry operations
  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db
      .insert(journalEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getUserJournalEntries(userId: string, limit = 50): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.isArchived, false)))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  async getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    return entry;
  }

  async updateJournalEntry(id: string, userId: string, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  async deleteJournalEntry(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(journalEntries)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async searchJournalEntries(userId: string, query: string, themes?: string[]): Promise<JournalEntry[]> {
    let whereConditions = [
      eq(journalEntries.userId, userId),
      eq(journalEntries.isArchived, false),
      sql`${journalEntries.content} ILIKE ${'%' + query + '%'}`
    ];

    if (themes && themes.length > 0) {
      whereConditions.push(sql`${journalEntries.themes} && ${themes}`);
    }

    return await db
      .select()
      .from(journalEntries)
      .where(and(...whereConditions))
      .orderBy(desc(journalEntries.createdAt));
  }

  // AI prompt operations
  async createAiPrompt(prompt: InsertAiPrompt): Promise<AiPrompt> {
    const [newPrompt] = await db
      .insert(aiPrompts)
      .values(prompt)
      .returning();
    return newPrompt;
  }

  async getUnusedPrompt(userId: string): Promise<AiPrompt | undefined> {
    const [prompt] = await db
      .select()
      .from(aiPrompts)
      .where(and(eq(aiPrompts.userId, userId), eq(aiPrompts.used, false)))
      .orderBy(desc(aiPrompts.createdAt))
      .limit(1);
    return prompt;
  }

  async markPromptAsUsed(id: string): Promise<void> {
    await db
      .update(aiPrompts)
      .set({ used: true })
      .where(eq(aiPrompts.id, id));
  }

  // Insight operations
  async createInsight(insight: InsertInsight): Promise<Insight> {
    const [newInsight] = await db
      .insert(insights)
      .values(insight)
      .returning();
    return newInsight;
  }

  async getUserInsights(userId: string, limit = 10): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .orderBy(desc(insights.createdAt))
      .limit(limit);
  }

  async markInsightAsViewed(id: string): Promise<void> {
    await db
      .update(insights)
      .set({ viewed: true })
      .where(eq(insights.id, id));
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<{
    totalEntries: number;
    currentStreak: number;
    averageMood: number;
    weeklyInsights: number;
  }> {
    // Total entries
    const [totalResult] = await db
      .select({ count: count() })
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.isArchived, false)));

    // Average mood (convert mood strings to numbers for calculation)
    const moodEntries = await db
      .select({ mood: journalEntries.mood })
      .from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.isArchived, false),
        sql`${journalEntries.mood} IS NOT NULL`
      ));

    const moodValues = moodEntries.map(entry => {
      switch (entry.mood) {
        case 'happy': return 9;
        case 'content': return 7;
        case 'neutral': return 5;
        case 'sad': return 3;
        case 'stressed': return 2;
        default: return 5;
      }
    });

    const averageMood = moodValues.length > 0 
      ? moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length / 10 * 10
      : 5;

    // Current streak (simplified - count consecutive days with entries)
    const recentEntries = await db
      .select({ createdAt: journalEntries.createdAt })
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.isArchived, false)))
      .orderBy(desc(journalEntries.createdAt));

    let currentStreak = 0;
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 0; i < recentEntries.length; i++) {
      const createdAt = recentEntries[i].createdAt;
      if (!createdAt) continue;
      
      const entryDate = new Date(createdAt);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / oneDay);
      
      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Weekly insights
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [weeklyInsightsResult] = await db
      .select({ count: count() })
      .from(insights)
      .where(and(
        eq(insights.userId, userId),
        gte(insights.createdAt, weekAgo)
      ));

    return {
      totalEntries: totalResult.count,
      currentStreak,
      averageMood: Math.round(averageMood * 10) / 10,
      weeklyInsights: weeklyInsightsResult.count,
    };
  }

  async getMoodTrends(userId: string, days: number): Promise<{ date: string; mood: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await db
      .select({
        createdAt: journalEntries.createdAt,
        mood: journalEntries.mood,
      })
      .from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.isArchived, false),
        gte(journalEntries.createdAt, startDate),
        sql`${journalEntries.mood} IS NOT NULL`
      ))
      .orderBy(journalEntries.createdAt);

    return entries.map(entry => ({
      date: entry.createdAt ? entry.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      mood: (() => {
        switch (entry.mood) {
          case 'happy': return 9;
          case 'content': return 7;
          case 'neutral': return 5;
          case 'sad': return 3;
          case 'stressed': return 2;
          default: return 5;
        }
      })(),
    }));
  }

  async getThemeAnalysis(userId: string, days: number): Promise<{ theme: string; count: number; percentage: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await db
      .select({ themes: journalEntries.themes })
      .from(journalEntries)
      .where(and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.isArchived, false),
        gte(journalEntries.createdAt, startDate),
        sql`${journalEntries.themes} IS NOT NULL`
      ));

    const themeCount = new Map<string, number>();
    let totalThemes = 0;

    entries.forEach(entry => {
      if (entry.themes) {
        entry.themes.forEach(theme => {
          themeCount.set(theme, (themeCount.get(theme) || 0) + 1);
          totalThemes++;
        });
      }
    });

    return Array.from(themeCount.entries())
      .map(([theme, count]) => ({
        theme,
        count,
        percentage: Math.round((count / totalThemes) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

export const storage = new DatabaseStorage();
