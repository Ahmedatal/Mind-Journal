import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JournalEntry } from "@shared/schema";
import { format } from "date-fns";

export default function Entries() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: entries, isLoading: entriesLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal/entries"],
    enabled: isAuthenticated,
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

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-feather text-primary-foreground"></i>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredEntries = entries?.filter(entry =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.themes?.some(theme => theme.toLowerCase().includes(searchQuery.toLowerCase())) ||
    entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const getMoodColor = (mood: string | null) => {
    switch (mood) {
      case 'happy': return 'bg-green-500';
      case 'content': return 'bg-blue-500';
      case 'neutral': return 'bg-gray-500';
      case 'sad': return 'bg-blue-700';
      case 'stressed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getMoodLabel = (mood: string | null) => {
    return mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'Unknown';
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <Sidebar />
      
      <div className="flex-1 lg:pl-64">
        <MobileHeader />
        
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
                  All Entries
                </h1>
                <p className="text-muted-foreground">
                  Browse and search through your journaling history
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex gap-2">
                <Input
                  placeholder="Search entries, themes, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                  data-testid="input-search"
                />
                <Button variant="outline" data-testid="button-advanced-search">
                  <i className="fas fa-sliders-h mr-2"></i>
                  Filters
                </Button>
              </div>
            </div>
          </div>

          {entriesLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-book text-muted-foreground text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {entries?.length === 0 ? "No entries yet" : "No matching entries"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {entries?.length === 0 
                    ? "Start your journaling journey by writing your first entry."
                    : "Try adjusting your search terms or filters."
                  }
                </p>
                {entries?.length === 0 && (
                  <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-first-entry">
                    <i className="fas fa-plus mr-2"></i>
                    Create Your First Entry
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`card-entry-${entry.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getMoodColor(entry.mood)}`}></div>
                        <span className="text-sm font-medium text-foreground">
                          {entry.createdAt ? format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a") : 'Unknown date'}
                        </span>
                        {entry.mood && (
                          <Badge variant="secondary" className="text-xs">
                            {getMoodLabel(entry.mood)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {entry.wordCount} words
                        </span>
                      </div>
                    </div>

                    {entry.title && (
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {entry.title}
                      </h3>
                    )}

                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {entry.content}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {entry.themes?.map((theme, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                        {entry.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-${entry.id}`}>
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-view-${entry.id}`}>
                          <i className="fas fa-external-link-alt mr-1"></i>
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
