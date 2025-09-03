import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./services/aiService";
import { insertJournalEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Journal entry routes
  app.post('/api/journal/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertJournalEntrySchema.parse(req.body);
      
      // Calculate word count
      const wordCount = entryData.content.trim().split(/\s+/).length;
      
      // Analyze sentiment and extract themes
      const [sentimentResult, themeResult] = await Promise.all([
        aiService.analyzeSentiment(entryData.content),
        aiService.extractThemes(entryData.content)
      ]);

      const entry = await storage.createJournalEntry({
        ...entryData,
        userId,
        wordCount,
        sentimentScore: sentimentResult.rating,
        sentimentConfidence: sentimentResult.confidence,
        themes: themeResult.themes,
      });

      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create entry" });
      }
    }
  });

  app.get('/api/journal/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const entries = await storage.getUserJournalEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.get('/api/journal/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const entry = await storage.getJournalEntry(id, userId);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  app.put('/api/journal/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const updates = insertJournalEntrySchema.partial().parse(req.body);
      
      // Recalculate analysis if content changed
      if (updates.content) {
        updates.wordCount = updates.content.trim().split(/\s+/).length;
        
        const [sentimentResult, themeResult] = await Promise.all([
          aiService.analyzeSentiment(updates.content),
          aiService.extractThemes(updates.content)
        ]);
        
        updates.sentimentScore = sentimentResult.rating;
        updates.sentimentConfidence = sentimentResult.confidence;
        updates.themes = themeResult.themes;
      }

      const entry = await storage.updateJournalEntry(id, userId, updates);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  app.delete('/api/journal/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const success = await storage.deleteJournalEntry(id, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json({ message: "Entry archived successfully" });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  app.get('/api/journal/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { q: query, themes } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const themeArray = themes ? themes.split(',') : undefined;
      const entries = await storage.searchJournalEntries(userId, query as string, themeArray);
      res.json(entries);
    } catch (error) {
      console.error("Error searching journal entries:", error);
      res.status(500).json({ message: "Failed to search entries" });
    }
  });

  // AI prompt routes
  app.post('/api/ai/prompts/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { context } = req.body;
      
      // Get recent entries for context
      const recentEntries = await storage.getUserJournalEntries(userId, 5);
      const aiPrompt = await aiService.generateEmpathicPrompt(recentEntries, context);
      
      const prompt = await storage.createAiPrompt({
        userId,
        prompt: aiPrompt.prompt,
        context: aiPrompt.context,
      });
      
      res.json(prompt);
    } catch (error) {
      console.error("Error generating AI prompt:", error);
      res.status(500).json({ message: "Failed to generate prompt" });
    }
  });

  app.get('/api/ai/prompts/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let prompt = await storage.getUnusedPrompt(userId);
      
      // Generate new prompt if none exists
      if (!prompt) {
        const recentEntries = await storage.getUserJournalEntries(userId, 5);
        const aiPrompt = await aiService.generateEmpathicPrompt(recentEntries);
        
        prompt = await storage.createAiPrompt({
          userId,
          prompt: aiPrompt.prompt,
          context: aiPrompt.context,
        });
      }
      
      res.json(prompt);
    } catch (error) {
      console.error("Error fetching current prompt:", error);
      res.status(500).json({ message: "Failed to fetch prompt" });
    }
  });

  app.post('/api/ai/prompts/:id/use', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markPromptAsUsed(id);
      res.json({ message: "Prompt marked as used" });
    } catch (error) {
      console.error("Error marking prompt as used:", error);
      res.status(500).json({ message: "Failed to mark prompt as used" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/analytics/mood-trends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      const trends = await storage.getMoodTrends(userId, days);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching mood trends:", error);
      res.status(500).json({ message: "Failed to fetch mood trends" });
    }
  });

  app.get('/api/analytics/themes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      const themes = await storage.getThemeAnalysis(userId, days);
      res.json(themes);
    } catch (error) {
      console.error("Error fetching theme analysis:", error);
      res.status(500).json({ message: "Failed to fetch theme analysis" });
    }
  });

  // Insights routes
  app.get('/api/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await storage.getUserInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.post('/api/insights/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get recent entries for analysis
      const recentEntries = await storage.getUserJournalEntries(userId, 20);
      const aiInsights = await aiService.generateInsights(recentEntries);
      
      const insights = [];
      for (const insight of aiInsights) {
        const created = await storage.createInsight({
          userId,
          type: insight.type,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence,
          data: insight.data,
          periodStart: recentEntries[recentEntries.length - 1]?.createdAt,
          periodEnd: recentEntries[0]?.createdAt,
        });
        insights.push(created);
      }
      
      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  app.post('/api/insights/:id/view', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markInsightAsViewed(id);
      res.json({ message: "Insight marked as viewed" });
    } catch (error) {
      console.error("Error marking insight as viewed:", error);
      res.status(500).json({ message: "Failed to mark insight as viewed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
