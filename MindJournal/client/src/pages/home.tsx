import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import WelcomeSection from "@/components/dashboard/welcome-section";
import AIPromptSection from "@/components/dashboard/ai-prompt-section";
import QuickWriteSection from "@/components/journal/quick-write-section";
import RecentEntriesSection from "@/components/journal/recent-entries-section";
import MoodTrendsWidget from "@/components/insights/mood-trends-widget";
import ThemeAnalysisWidget from "@/components/insights/theme-analysis-widget";
import PrivacyWidget from "@/components/insights/privacy-widget";
import WeeklyInsightsWidget from "@/components/insights/weekly-insights-widget";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User } from "@shared/schema";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-secondary/20">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-feather text-primary-foreground"></i>
          </div>
          <p className="text-muted-foreground">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <Sidebar />
      
      <div className="flex-1 lg:pl-64">
        <MobileHeader />
        
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8" data-testid="main-dashboard">
          <WelcomeSection user={user as User | undefined} />
          <AIPromptSection />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <QuickWriteSection />
              <RecentEntriesSection />
            </div>

            <div className="space-y-8">
              <MoodTrendsWidget />
              <ThemeAnalysisWidget />
              <PrivacyWidget />
              <WeeklyInsightsWidget />
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
