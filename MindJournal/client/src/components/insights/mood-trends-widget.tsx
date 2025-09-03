import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function MoodTrendsWidget() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("7");

  const { data: moodTrends, isLoading, error } = useQuery<{ date: string; mood: number }[]>({
    queryKey: ["/api/analytics/mood-trends", { days: parseInt(timeframe) }],
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

  const getBarHeight = (mood: number) => {
    // Normalize mood value (1-10) to percentage (10%-100%)
    return Math.max(10, (mood / 10) * 100);
  };

  const getBarColor = (mood: number) => {
    if (mood >= 8) return 'bg-green-500';
    if (mood >= 6) return 'bg-blue-500';
    if (mood >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInsightText = () => {
    if (!moodTrends || moodTrends.length === 0) return null;
    
    const avgMood = moodTrends.reduce((sum, day) => sum + day.mood, 0) / moodTrends.length;
    const trend = moodTrends.length > 1 ? 
      moodTrends[moodTrends.length - 1].mood - moodTrends[0].mood : 0;

    if (trend > 1) {
      return "📈 Your mood has been trending upward this period";
    } else if (trend < -1) {
      return "📉 Your mood has been declining this period";
    } else if (avgMood >= 7) {
      return "😊 You've been feeling positive overall";
    } else {
      return "💚 Keep reflecting - every day is a new opportunity";
    }
  };

  return (
    <Card className="bg-card rounded-2xl border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Mood Trends
          </CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24 text-sm border border-border" data-testid="select-mood-timeframe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div>
            <div className="h-32 flex items-end space-x-2 mb-4">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${30 + i * 10}%` }} />
              ))}
            </div>
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : !moodTrends || moodTrends.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-chart-line text-muted-foreground"></i>
            </div>
            <p className="text-sm text-muted-foreground">
              Write a few entries to see your mood trends
            </p>
          </div>
        ) : (
          <>
            <div className="h-32 flex items-end space-x-2 mb-4" data-testid="mood-chart">
              {moodTrends.slice(-7).map((day, index) => (
                <div 
                  key={index} 
                  className={`flex-1 ${getBarColor(day.mood)} rounded-t-lg transition-all duration-500 opacity-80 hover:opacity-100`}
                  style={{ height: `${getBarHeight(day.mood)}%` }}
                  title={`${day.date}: ${day.mood}/10`}
                ></div>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p data-testid="mood-insight">{getInsightText()}</p>
              {moodTrends.length > 0 && (
                <p>
                  ✨ Average mood: {(moodTrends.reduce((sum, day) => sum + day.mood, 0) / moodTrends.length).toFixed(1)}/10
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
