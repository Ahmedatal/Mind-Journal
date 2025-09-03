import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertJournalEntrySchema, InsertJournalEntryInput } from "@shared/schema";
import { z } from "zod";

const moodOptions = [
  { id: 'happy', label: 'Happy', color: 'bg-green-500' },
  { id: 'content', label: 'Content', color: 'bg-blue-500' },
  { id: 'neutral', label: 'Neutral', color: 'bg-gray-500' },
  { id: 'sad', label: 'Sad', color: 'bg-blue-700' },
  { id: 'stressed', label: 'Stressed', color: 'bg-red-500' },
];

export default function QuickWriteSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [isDraft, setIsDraft] = useState(false);

  const createEntryMutation = useMutation({
    mutationFn: async (entryData: InsertJournalEntryInput) => {
      return await apiRequest("POST", "/api/journal/entries", entryData);
    },
    onSuccess: () => {
      // Clear form
      setTitle("");
      setContent("");
      setSelectedMood("");
      setTags("");
      setIsDraft(false);
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Failed to save entry",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveEntry = () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before saving your entry.",
        variant: "destructive",
      });
      return;
    }

    try {
      const entryData = insertJournalEntrySchema.parse({
        title: title.trim() || undefined,
        content: content.trim(),
        mood: selectedMood || undefined,
        tags: tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        isArchived: false,
      });

      createEntryMutation.mutate(entryData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid entry data",
          description: error.errors[0]?.message || "Please check your entry and try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveDraft = () => {
    // For now, we'll save drafts the same way as regular entries
    // In a full implementation, you might have a separate draft system
    setIsDraft(true);
    handleSaveEntry();
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border writing-mode">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        How was your day?
      </h3>
      
      {/* Title Input */}
      <div className="mb-4">
        <Input
          placeholder="Entry title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-border bg-muted/30"
          data-testid="input-entry-title"
        />
      </div>
      
      {/* Mood Selector */}
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          How are you feeling?
        </p>
        <div className="flex flex-wrap gap-3">
          {moodOptions.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(selectedMood === mood.id ? "" : mood.id)}
              className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                selectedMood === mood.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
              data-testid={`button-mood-${mood.id}`}
            >
              <span className={`w-3 h-3 rounded-full ${mood.color} mr-2`}></span>
              <span className="text-sm">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Writing Area */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-32 p-4 border border-border rounded-lg resize-none focus:ring-2 focus:ring-ring focus:border-transparent bg-muted/30 placeholder:text-muted-foreground mb-4"
        placeholder="Start writing about your day, your thoughts, or anything on your mind..."
        data-testid="textarea-entry-content"
      />

      {/* Tags Input */}
      <div className="mb-4">
        <Input
          placeholder="Add tags (separated by commas)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="border-border bg-muted/30"
          data-testid="input-entry-tags"
        />
      </div>
      
      {/* Writing Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span data-testid="text-word-count">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          <button 
            className="hover:text-foreground transition-colors"
            data-testid="button-voice-note"
          >
            <i className="fas fa-microphone mr-1"></i>
            Voice note
          </button>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleSaveDraft}
            disabled={createEntryMutation.isPending || !content.trim()}
            variant="outline"
            className="px-4 py-2 text-sm font-medium border-border hover:bg-muted"
            data-testid="button-save-draft"
          >
            Save Draft
          </Button>
          <Button 
            onClick={handleSaveEntry}
            disabled={createEntryMutation.isPending || !content.trim()}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            data-testid="button-save-entry"
          >
            {createEntryMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              'Save Entry'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
