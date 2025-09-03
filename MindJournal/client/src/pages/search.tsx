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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JournalEntry } from "@shared/schema";
import { format } from "date-fns";

export default function Search() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [moodFilter, setMoodFilter] = useState<string>("");

  const { data: allEntries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal/entries"],
    enabled: isAuthenticated,
  });

  // Get all unique themes from entries for filter options
  const allThemes = Array.from(
    new Set(
      allEntries?.flatMap(entry => entry.themes || []) || []
    )
  ).sort();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (selectedThemes.length > 0) {
        params.append('themes', selectedThemes.join(','));
      }
      
      const response = await fetch(`/api/journal/search?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
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
        title: "Search failed",
        description: "Unable to search entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <Sidebar />
      
      <div className="flex-1 lg:pl-64">
        <MobileHeader />
        
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-search-title">
              Search Your Journal
            </h1>
            <p className="text-muted-foreground">
              Find past entries by keywords, themes, or emotional state
            </p>
          </div>

          {/* Search Input */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search your entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-base"
                    data-testid="input-search-query"
                  />
                </div>
                <Button 
                  onClick={() => handleSearch(searchQuery)}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-search"
                >
                  {isSearching ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-search mr-2"></i>
                  )}
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="w-48">
                  <Select value={moodFilter} onValueChange={setMoodFilter}>
                    <SelectTrigger data-testid="select-mood-filter">
                      <SelectValue placeholder="Filter by mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All moods</SelectItem>
                      <SelectItem value="happy">Happy</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="stressed">Stressed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {allThemes.length > 0 && (
                  <div className="flex-1 min-w-48">
                    <div className="flex flex-wrap gap-2">
                      {allThemes.slice(0, 8).map((theme) => (
                        <Button
                          key={theme}
                          variant={selectedThemes.includes(theme) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedThemes(prev => 
                              prev.includes(theme) 
                                ? prev.filter(t => t !== theme)
                                : [...prev, theme]
                            );
                          }}
                          className="text-xs"
                          data-testid={`button-theme-${theme}`}
                        >
                          {theme}
                        </Button>
                      ))}
                      {selectedThemes.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedThemes([])}
                          className="text-xs text-muted-foreground"
                          data-testid="button-clear-themes"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchQuery && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Search Results
                  <Badge variant="secondary">
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSearching ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-search text-muted-foreground text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try different keywords or adjust your filters
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((entry) => (
                      <div 
                        key={entry.id} 
                        className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        data-testid={`result-${entry.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
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
                          <span className="text-xs text-muted-foreground">
                            {entry.wordCount} words
                          </span>
                        </div>

                        {entry.title && (
                          <h4 className="font-medium text-foreground mb-2">{entry.title}</h4>
                        )}

                        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                          {entry.content}
                        </p>

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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Searches or Suggestions */}
          {!searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['work', 'family', 'gratitude', 'stress', 'goals'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          handleSearch(suggestion);
                        }}
                        className="w-full justify-start"
                        data-testid={`button-quick-search-${suggestion}`}
                      >
                        <i className="fas fa-search mr-2 text-xs"></i>
                        Search for "{suggestion}"
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-lightbulb text-accent mt-1"></i>
                      <span>Use specific keywords to find relevant entries</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-tags text-primary mt-1"></i>
                      <span>Filter by themes to narrow your results</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-heart text-red-500 mt-1"></i>
                      <span>Use mood filters to find entries by emotional state</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <i className="fas fa-calendar text-blue-500 mt-1"></i>
                      <span>Try searching for specific events or dates</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
