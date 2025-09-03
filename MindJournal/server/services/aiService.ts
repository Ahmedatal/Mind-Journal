import OpenAI from "openai";
import { JournalEntry } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface SentimentAnalysis {
  rating: number;
  confidence: number;
}

export interface ThemeAnalysis {
  themes: string[];
}

export interface AIPrompt {
  prompt: string;
  context: string;
}

export class AIService {
  // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
  private model = "gpt-5";

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis expert. Analyze the sentiment of the journal entry and provide a rating from 1 to 5 (1 = very negative, 2 = negative, 3 = neutral, 4 = positive, 5 = very positive) and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }"
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      return {
        rating: Math.max(1, Math.min(5, Math.round(result.rating))),
        confidence: Math.max(0, Math.min(1, result.confidence)),
      };
    } catch (error) {
      console.error("Failed to analyze sentiment:", error);
      return { rating: 3, confidence: 0.5 };
    }
  }

  async extractThemes(text: string): Promise<ThemeAnalysis> {
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a text analysis expert. Extract the main themes from this journal entry. Focus on life categories like work, family, health, relationships, personal growth, stress, gratitude, exercise, creativity, etc. Return up to 5 most relevant themes. Respond with JSON in this format: { 'themes': ['theme1', 'theme2'] }"
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        themes: result.themes || [],
      };
    } catch (error) {
      console.error("Failed to extract themes:", error);
      return { themes: [] };
    }
  }

  async generateEmpathicPrompt(recentEntries: JournalEntry[], userContext?: string): Promise<AIPrompt> {
    try {
      const contextText = recentEntries
        .slice(0, 5)
        .map(entry => `${entry.mood || 'neutral'}: ${entry.content.substring(0, 200)}`)
        .join('\n\n');

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an empathetic journaling companion. Based on the user's recent journal entries, generate a thoughtful, personalized writing prompt that encourages reflection and self-discovery. The prompt should be:
            - Empathetic and non-judgmental
            - Specific to their recent experiences or patterns
            - Encouraging of deeper reflection
            - About 1-2 sentences long
            - Focused on growth and self-awareness

            Respond with JSON in this format: { 'prompt': 'your prompt here', 'context': 'brief explanation of what inspired this prompt' }`
          },
          {
            role: "user",
            content: `Recent journal entries:\n${contextText}\n\nAdditional context: ${userContext || 'None'}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        prompt: result.prompt || "What's one thing you learned about yourself today?",
        context: result.context || "General reflection prompt"
      };
    } catch (error) {
      console.error("Failed to generate AI prompt:", error);
      return {
        prompt: "How did you show kindness to yourself or others today?",
        context: "Default empathetic prompt"
      };
    }
  }

  async generateInsights(entries: JournalEntry[]): Promise<Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
    data?: any;
  }>> {
    if (entries.length < 3) {
      return [];
    }

    try {
      const entriesText = entries
        .map(entry => `Date: ${entry.createdAt ? entry.createdAt.toDateString() : 'Unknown'}, Mood: ${entry.mood || 'not specified'}, Content: ${entry.content.substring(0, 300)}`)
        .join('\n\n');

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a personal insights analyst. Analyze the journal entries and identify meaningful patterns, correlations, or trends that could help the user understand themselves better. Look for:
            - Mood patterns related to activities, times, or situations
            - Recurring themes or concerns
            - Growth or positive changes
            - Correlations between different aspects of life
            
            Generate up to 3 insights. Each insight should be encouraging and constructive. Respond with JSON in this format: 
            { 'insights': [{ 'type': 'pattern|correlation|trend', 'title': 'brief title', 'description': 'helpful description', 'confidence': 0.8 }] }`
          },
          {
            role: "user",
            content: `Journal entries to analyze:\n${entriesText}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.insights || [];
    } catch (error) {
      console.error("Failed to generate insights:", error);
      return [];
    }
  }
}

export const aiService = new AIService();
