import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Map,
  Package,
  Users,
  BarChart3,
  FileText,
  Waves
} from "lucide-react";

const navigation = [
  {
    name: "Main",
    items: [
      { name: "Overview", href: "/", icon: LayoutDashboard },
      { name: "Flood Mapping", href: "/flood-mapping", icon: Waves },
    ],
  },
  {
    name: "Operations", 
    items: [
      { name: "Resource Management", href: "/resources", icon: Package },
      { name: "Population Registry", href: "/population", icon: Users },
      { name: "Relief Distribution", href: "/distribution", icon: Map },
    ],
  },
  {
    name: "Analysis",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Reports", href: "/reports", icon: FileText },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0" data-testid="sidebar">
      <nav className="p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.name} className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {section.name}
            </h3>
            {section.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
