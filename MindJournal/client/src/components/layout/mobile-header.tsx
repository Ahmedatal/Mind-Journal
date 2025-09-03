import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function MobileHeader() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'fas fa-home' },
    { name: 'New Entry', href: '/write', icon: 'fas fa-edit' },
    { name: 'All Entries', href: '/entries', icon: 'fas fa-book' },
    { name: 'Insights', href: '/insights', icon: 'fas fa-chart-line' },
    { name: 'Search', href: '/search', icon: 'fas fa-search' },
  ];

  const secondaryNavigation = [
    { name: 'Privacy', href: '/privacy', icon: 'fas fa-shield-alt' },
    { name: 'Settings', href: '/settings', icon: 'fas fa-cog' },
  ];

  return (
    <div className="lg:hidden bg-card border-b border-border px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
            <i className="fas fa-feather text-primary-foreground text-sm"></i>
          </div>
          <span className="text-lg font-semibold text-foreground" data-testid="text-mobile-brand">
            Mindful Journal
          </span>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
              <i className="fas fa-bars"></i>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col h-full">
              <div className="py-4 border-b border-border">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-feather text-primary-foreground text-sm"></i>
                  </div>
                  <span className="text-lg font-semibold text-foreground">Mindful Journal</span>
                </div>
              </div>

              <nav className="flex-1 py-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      data-testid={`mobile-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <i className={`${item.icon} mr-3`}></i>
                      {item.name}
                    </a>
                  );
                })}
                
                <div className="border-t border-border pt-4 mt-4">
                  {secondaryNavigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                      >
                        <i className={`${item.icon} mr-3`}></i>
                        {item.name}
                      </a>
                    );
                  })}
                </div>
              </nav>

              <div className="py-4 border-t border-border">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">JD</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-foreground">Journal User</p>
                    <p className="text-xs text-muted-foreground">Member since Oct 2024</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="w-full"
                  data-testid="button-mobile-logout"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
