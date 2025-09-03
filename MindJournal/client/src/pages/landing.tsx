import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-secondary/20">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      {/* Header */}
      <header className="px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3">
              <i className="fas fa-feather text-primary-foreground"></i>
            </div>
            <span className="text-2xl font-bold text-foreground">Mindful Journal</span>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Your AI-Powered
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Journaling Companion
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your thoughts into insights with empathetic AI guidance, 
              sentiment analysis, and personalized reflection prompts that help you 
              understand yourself better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg"
                data-testid="button-start-journaling"
              >
                <i className="fas fa-edit mr-2"></i>
                Start Journaling
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-border hover:bg-muted px-8 py-4 text-lg"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-robot text-primary text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">AI-Powered Prompts</h3>
                <p className="text-muted-foreground">
                  Get personalized writing prompts based on your mood, recent entries, 
                  and emotional patterns to spark meaningful reflection.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-chart-line text-secondary-foreground text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Emotional Insights</h3>
                <p className="text-muted-foreground">
                  Track your emotional journey with sentiment analysis and discover 
                  patterns in your mood and thoughts over time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-shield-alt text-accent-foreground text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Privacy First</h3>
                <p className="text-muted-foreground">
                  Your thoughts stay yours. All analysis is done securely with 
                  end-to-end encryption and no data sharing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-chart-4/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-lightbulb text-purple-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Theme Discovery</h3>
                <p className="text-muted-foreground">
                  Automatically identify recurring themes in your writing like work, 
                  relationships, and personal growth.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-chart-2/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-search text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Smart Search</h3>
                <p className="text-muted-foreground">
                  Find past entries by keywords, themes, or emotional state. 
                  Rediscover insights from your journey.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-chart-5/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-calendar-alt text-red-500 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Build consistent journaling habits with streak tracking and 
                  weekly reflection summaries.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Ready to Begin Your Journey?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Join thousands who've transformed their self-reflection practice 
                  with our AI-powered journaling companion.
                </p>
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg"
                  data-testid="button-get-started"
                >
                  <i className="fas fa-arrow-right mr-2"></i>
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
