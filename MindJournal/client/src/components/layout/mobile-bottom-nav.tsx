import { useLocation } from "wouter";

export default function MobileBottomNav() {
  const [location] = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: 'fas fa-home' },
    { name: 'Write', href: '/write', icon: 'fas fa-edit' },
    { name: 'Entries', href: '/entries', icon: 'fas fa-book' },
    { name: 'Insights', href: '/insights', icon: 'fas fa-chart-line' },
    { name: 'Search', href: '/search', icon: 'fas fa-search' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 safe-area-pb">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid={`mobile-nav-${item.name.toLowerCase()}`}
            >
              <i className={`${item.icon} text-lg mb-1`}></i>
              <span className="text-xs">{item.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
