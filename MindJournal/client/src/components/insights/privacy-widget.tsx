import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PrivacyWidget() {
  return (
    <Card className="bg-gradient-to-br from-muted/50 to-secondary/20 rounded-2xl border border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-secondary/30 rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-alt text-secondary-foreground"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Your Privacy</h3>
            <p className="text-sm text-muted-foreground">Secured & Protected</p>
          </div>
        </div>
        
        <div className="space-y-3 text-sm mb-6">
          <div className="flex items-center space-x-2">
            <i className="fas fa-check-circle text-secondary w-4"></i>
            <span className="text-muted-foreground">End-to-end encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-check-circle text-secondary w-4"></i>
            <span className="text-muted-foreground">Secure AI analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-check-circle text-secondary w-4"></i>
            <span className="text-muted-foreground">No data sharing</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-check-circle text-secondary w-4"></i>
            <span className="text-muted-foreground">Data ownership control</span>
          </div>
        </div>
        
        <Button 
          variant="ghost"
          size="sm"
          className="w-full text-sm text-secondary-foreground hover:text-secondary font-medium p-0"
          data-testid="button-privacy-settings"
        >
          Manage privacy settings →
        </Button>
      </CardContent>
    </Card>
  );
}
