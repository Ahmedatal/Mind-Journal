import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { AiPrompt } from "@shared/schema";

export default function AIPromptSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: currentPrompt, isLoading, error } = useQuery<AiPrompt>({
    queryKey: ["/api/ai/prompts/current"],
  });

  const generateNewPromptMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/ai/prompts/generate", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/prompts/current"] });
      toast({
        title: "New prompt generated",
        description: "Here's a fresh writing suggestion for you!",
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
        title: "Failed to generate prompt",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const usePromptMutation = useMutation({
    mutationFn: async (promptId: string) => {
      return await apiRequest("POST", `/api/ai/prompts/${promptId}/use`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/prompts/current"] });
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
      console.error("Failed to mark prompt as used:", error);
    },
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  const handleUsePrompt = () => {
    if (currentPrompt) {
      usePromptMutation.mutate(currentPrompt.id);
      // Here we would typically scroll to the writing area or fill it with the prompt
      const textarea = document.querySelector('textarea');
      if (textarea && !textarea.value.trim()) {
        textarea.value = currentPrompt.prompt + "\n\n";
        textarea.focus();
      }
    }
  };

  const handleGenerateNewPrompt = () => {
    setIsGenerating(true);
    generateNewPromptMutation.mutate();
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-robot text-white"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Your AI Companion Suggests
            </h3>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-4"></div>
              </div>
            ) : currentPrompt ? (
              <p className="text-muted-foreground mb-4" data-testid="text-ai-prompt">
                {currentPrompt.prompt}
              </p>
            ) : (
              <p className="text-muted-foreground mb-4">
                Write a few entries to get personalized prompts!
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {currentPrompt && (
                <Button 
                  onClick={handleUsePrompt}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  data-testid="button-use-prompt"
                >
                  Use this prompt
                </Button>
              )}
              <Button 
                onClick={handleGenerateNewPrompt}
                disabled={isGenerating || generateNewPromptMutation.isPending}
                variant="outline"
                className="bg-card hover:bg-muted text-foreground border border-border px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                data-testid="button-new-suggestion"
              >
                {isGenerating || generateNewPromptMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-refresh mr-2"></i>
                )}
                New suggestion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
