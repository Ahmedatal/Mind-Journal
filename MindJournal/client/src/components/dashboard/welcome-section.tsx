import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface WelcomeSectionProps {
  user?: User;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error } = useQuery<{
    totalEntries: number;
    currentStreak: number;
    averageMood: number;
    weeklyInsights: number;
  }>({
    queryKey: ["/api/analytics/stats"],
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return "there";
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome-greeting">
            {getGreeting()}, {getFirstName()} ✨
          </h1>
          <p className="text-muted-foreground">
            How are you feeling today? Let's reflect together.
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            data-testid="button-new-entry"
          >
            <i className="fas fa-plus mr-2"></i>
            New Entry
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-current-streak">
                {statsLoading ? "..." : stats?.currentStreak || 0}
              </p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-fire text-primary"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-total-entries">
                {statsLoading ? "..." : stats?.totalEntries || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </div>
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-secondary-foreground"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-average-mood">
                {statsLoading ? "..." : stats?.averageMood || 0}
              </p>
              <p className="text-sm text-muted-foreground">Avg Mood</p>
            </div>
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-smile text-accent-foreground"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-weekly-insights">
                {statsLoading ? "..." : stats?.weeklyInsights || 0}
              </p>
              <p className="text-sm text-muted-foreground">New Insights</p>
            </div>
            <div className="w-10 h-10 bg-chart-4/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-lightbulb text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
