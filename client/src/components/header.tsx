import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Waves, AlertTriangle, LogOut, User } from "lucide-react";
import type { WeatherAlert } from "@shared/schema";

export function Header() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: alerts = [] } = useQuery<WeatherAlert[]>({
    queryKey: ["/api/weather-alerts"],
    refetchInterval: 30000,
  });

  const activeAlertsCount = alerts.filter(alert => alert.isActive).length;

  const getInitials = (user: any) => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (user: any) => {
    if (!user) return "User";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "district_officer":
        return "District Officer";
      case "ngo":
        return "NGO Worker";
      case "field_worker":
        return "Field Worker";
      default:
        return "User";
    }
  };

  return (
    <header 
      className="bg-card border-b border-border sticky top-0 z-50"
      data-testid="header"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Waves className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">FloodWatch</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Emergency Alert Indicator */}
          {activeAlertsCount > 0 && (
            <Badge 
              variant="destructive" 
              className="flex items-center space-x-1 px-3 py-1"
              data-testid="alert-badge"
            >
              <AlertTriangle className="w-3 h-3 animate-pulse" />
              <span className="font-medium">
                {activeAlertsCount} Active Alert{activeAlertsCount !== 1 ? 's' : ''}
              </span>
            </Badge>
          )}

          {/* User Profile */}
          {isAuthLoading ? (
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-auto p-0 hover:bg-transparent"
                  data-testid="user-menu-trigger"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {getDisplayName(user)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getRoleLabel((user as any)?.role)} {(user as any)?.district && `• ${(user as any).district}`}
                      </div>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(user as any)?.profileImageUrl} />
                      <AvatarFallback className="text-sm">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center space-x-2 text-destructive"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => window.location.href = '/api/login'}
              data-testid="login-button"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
