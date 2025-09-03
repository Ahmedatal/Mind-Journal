import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JournalEntry } from "@shared/schema";
import { format } from "date-fns";

export default function RecentEntriesSection() {
  const { toast } = useToast();

  const { data: entries, isLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal/entries"],
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

  const getMoodColor = (mood: string | null) => {
    switch (mood) {
      case 'happy': return 'border-l-green-500';
      case 'content': return 'border-l-blue-500';
      case 'neutral': return 'border-l-gray-500';
      case 'sad': return 'border-l-blue-700';
      case 'stressed': return 'border-l-red-500';
      default: return 'border-l-gray-400';
    }
  };

  const getMoodIndicatorColor = (mood: string | null) => {
    switch (mood) {
      case 'happy': return 'bg-green-500';
      case 'content': return 'bg-blue-500';
      case 'neutral': return 'bg-gray-500';
      case 'sad': return 'bg-blue-700';
      case 'stressed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const recentEntries = entries?.slice(0, 3) || [];

  return (
    <Card className="bg-card rounded-2xl border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Recent Entries
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm text-primary hover:text-primary/80 font-medium"
            onClick={() => window.location.href = '/entries'}
            data-testid="button-view-all-entries"
          >
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-l-4 border-l-muted bg-muted/30 rounded-r-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex space-x-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-book text-muted-foreground text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No entries yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your journaling journey by writing your first entry above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <div 
                key={entry.id} 
                className={`border-l-4 ${getMoodColor(entry.mood)} bg-muted/30 rounded-r-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer`}
                onClick={() => window.location.href = `/entries`}
                data-testid={`recent-entry-${entry.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${getMoodIndicatorColor(entry.mood)}`}></span>
                    <span className="text-sm font-medium text-foreground">
                      {entry.createdAt ? format(new Date(entry.createdAt), "MMM d, h:mm a") : 'Unknown date'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {entry.themes?.slice(0, 2).map((theme, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs px-2 py-1"
                      >
                        {theme}
                      </Badge>
                    ))}
                    {entry.tags?.slice(0, 1).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs px-2 py-1"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
