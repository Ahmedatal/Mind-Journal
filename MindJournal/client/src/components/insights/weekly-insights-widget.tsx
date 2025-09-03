import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Insight } from "@shared/schema";
import { format } from "date-fns";

export default function WeeklyInsightsWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights, isLoading, error } = useQuery<Insight[]>({
    queryKey: ["/api/insights"],
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/insights/generate", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "New insights generated",
        description: "Fresh insights about your journaling patterns are ready!",
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
        title: "Failed to generate insights",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return 'fas fa-chart-line';
      case 'correlation': return 'fas fa-link';
      case 'trend': return 'fas fa-trending-up';
      default: return 'fas fa-star';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-primary/20 text-primary';
      case 'correlation': return 'bg-secondary/20 text-secondary-foreground';
      case 'trend': return 'bg-accent/20 text-accent-foreground';
      default: return 'bg-chart-4/20 text-purple-600';
    }
  };

  const recentInsights = insights?.slice(0, 2) || [];

  return (
    <Card className="bg-card rounded-2xl border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            AI Insights
          </CardTitle>
          {insights && insights.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm text-primary hover:text-primary/80 font-medium"
              onClick={() => window.location.href = '/insights'}
              data-testid="button-view-all-insights"
            >
              View all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-border">
                <div className="flex items-start space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !insights || insights.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-lightbulb text-muted-foreground"></i>
            </div>
            <h4 className="text-sm font-medium text-foreground mb-2">No insights yet</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Write a few more entries to get AI-powered insights about your patterns.
            </p>
            <Button 
              size="sm"
              onClick={() => generateInsightsMutation.mutate()}
              disabled={generateInsightsMutation.isPending}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-generate-insights"
            >
              {generateInsightsMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              {recentInsights.map((insight) => (
                <div 
                  key={insight.id} 
                  className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20"
                  data-testid={`insight-preview-${insight.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 ${getInsightColor(insight.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <i className={`${getInsightIcon(insight.type)} text-sm`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-foreground">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {insight.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {insight.createdAt ? format(new Date(insight.createdAt), "MMM d") : 'Unknown'} • 
                        {insight.confidence && (
                          <span className="ml-1">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => generateInsightsMutation.mutate()}
                disabled={generateInsightsMutation.isPending}
                className="text-sm text-muted-foreground hover:text-foreground"
                data-testid="button-refresh-insights"
              >
                {generateInsightsMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-refresh mr-2"></i>
                )}
                Refresh
              </Button>
              
              {insights.length > 0 && (
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                  onClick={() => window.location.href = '/insights'}
                  data-testid="button-view-detailed-insights"
                >
                  View detailed insights →
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
