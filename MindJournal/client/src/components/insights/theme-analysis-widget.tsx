import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ThemeAnalysisWidget() {
  const { toast } = useToast();
  const [timeframe] = useState(7); // Default to 7 days

  const { data: themes, isLoading, error } = useQuery<{ theme: string; count: number; percentage: number }[]>({
    queryKey: ["/api/analytics/themes", { days: timeframe }],
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

  const getThemeColor = (index: number) => {
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-chart-4',
      'bg-chart-5'
    ];
    return colors[index % colors.length];
  };

  const getThemeIcon = (theme: string) => {
    const themeIcons: { [key: string]: string } = {
      'work': 'fas fa-briefcase',
      'career': 'fas fa-briefcase',
      'family': 'fas fa-home',
      'relationships': 'fas fa-heart',
      'health': 'fas fa-heartbeat',
      'exercise': 'fas fa-dumbbell',
      'fitness': 'fas fa-dumbbell',
      'gratitude': 'fas fa-hands',
      'stress': 'fas fa-exclamation-triangle',
      'goals': 'fas fa-target',
      'learning': 'fas fa-book',
      'creativity': 'fas fa-palette',
      'travel': 'fas fa-plane',
      'food': 'fas fa-utensils',
      'nature': 'fas fa-leaf',
      'friends': 'fas fa-users',
      'personal growth': 'fas fa-seedling',
      'sleep': 'fas fa-bed',
      'money': 'fas fa-dollar-sign',
      'hobbies': 'fas fa-gamepad',
    };
    
    return themeIcons[theme.toLowerCase()] || 'fas fa-tag';
  };

  const topThemes = themes?.slice(0, 5) || [];
  const mostFrequentTheme = topThemes[0];

  return (
    <Card className="bg-card rounded-2xl border border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          This Week's Themes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-20 h-2 rounded-full" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : !themes || themes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-tags text-muted-foreground"></i>
            </div>
            <p className="text-sm text-muted-foreground">
              Write more entries to discover your themes
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {topThemes.map((theme, index) => (
                <div key={theme.theme} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${getThemeColor(index)} rounded-full`}></div>
                    <div className="flex items-center space-x-2">
                      <i className={`${getThemeIcon(theme.theme)} text-muted-foreground text-xs`}></i>
                      <span className="text-sm font-medium text-foreground capitalize">
                        {theme.theme}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getThemeColor(index)} rounded-full transition-all duration-500`}
                        style={{ width: `${theme.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground min-w-[2rem] text-right">
                      {theme.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {mostFrequentTheme && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <i className="fas fa-lightbulb mr-1 text-accent"></i>
                  <strong>AI Insight:</strong> You write most frequently about "{mostFrequentTheme.theme}" - 
                  this theme appeared in {mostFrequentTheme.count} of your recent entries.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
