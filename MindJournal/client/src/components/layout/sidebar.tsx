import { useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

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
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Logo and Brand */}
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-feather text-primary-foreground text-sm"></i>
            </div>
            <span className="text-xl font-semibold text-foreground" data-testid="text-brand-name">
              Mindful Journal
            </span>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
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
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <i className={`${item.icon} mr-3`}></i>
                  {item.name}
                </a>
              );
            })}
          </div>
        </nav>
        
        {/* User Profile */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white" data-testid="text-user-initials">
                JD
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                Journal User
              </p>
              <button 
                onClick={() => window.location.href = '/api/logout'}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-logout"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
