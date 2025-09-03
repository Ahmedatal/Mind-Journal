import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import MoodTrendsWidget from "@/components/insights/mood-trends-widget";
import ThemeAnalysisWidget from "@/components/insights/theme-analysis-widget";
import WeeklyInsightsWidget from "@/components/insights/weekly-insights-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Insight } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Insights() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: insights, isLoading: insightsLoading, error } = useQuery<Insight[]>({
    queryKey: ["/api/insights"],
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
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return 'fas fa-chart-line';
      case 'correlation': return 'fas fa-link';
      case 'trend': return 'fas fa-trending-up';
      default: return 'fas fa-lightbulb';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
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
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-insights-title">
                  Insights & Analytics
                </h1>
                <p className="text-muted-foreground">
                  Discover patterns and understand your emotional journey
                </p>
              </div>
              <Button className="mt-4 lg:mt-0 bg-primary hover:bg-primary/90" data-testid="button-generate-insights">
                <i className="fas fa-magic mr-2"></i>
                Generate New Insights
              </Button>
            </div>
          </div>

          {/* Analytics Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2">
              <MoodTrendsWidget />
            </div>
            <ThemeAnalysisWidget />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <WeeklyInsightsWidget />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Journaling Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Best writing time</span>
                    <span className="text-sm font-medium">8:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average session</span>
                    <span className="text-sm font-medium">12 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Most productive day</span>
                    <span className="text-sm font-medium">Tuesday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average entry length</span>
                    <span className="text-sm font-medium">245 words</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI-Generated Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {insights?.length || 0} insights
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : insights && insights.length > 0 ? (
                <div className="space-y-6">
                  {insights.map((insight) => (
                    <div key={insight.id} className="border-l-4 border-l-primary/30 pl-6 py-4" data-testid={`insight-${insight.id}`}>
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <i className={`${getInsightIcon(insight.type)} text-primary text-sm`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{insight.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {insight.type}
                              </Badge>
                              <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence || 0)}`}>
                                {Math.round((insight.confidence || 0) * 100)}% confidence
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Generated {insight.createdAt ? format(new Date(insight.createdAt), "MMM d, yyyy") : 'Unknown date'}
                            </span>
                            {insight.periodStart && insight.periodEnd && (
                              <span>
                                Based on entries from {format(new Date(insight.periodStart), "MMM d")} - {format(new Date(insight.periodEnd), "MMM d")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-lightbulb text-muted-foreground text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No insights yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Write a few more entries to get personalized insights about your journaling patterns.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90" data-testid="button-generate-first-insights">
                    <i className="fas fa-magic mr-2"></i>
                    Generate Insights
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
