import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Cloud, Waves } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { WeatherAlert } from "@shared/schema";

export function AlertsPanel() {
  const { data: alerts = [], isLoading } = useQuery<WeatherAlert[]>({
    queryKey: ["/api/weather-alerts"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "flood_warning":
        return <Waves className="w-4 h-4" />;
      case "heavy_rain":
        return <Cloud className="w-4 h-4" />;
      case "dam_release":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          badge: "destructive" as const,
          bg: "bg-destructive/5",
          border: "border-destructive/20",
          dot: "bg-destructive",
        };
      case "medium":
        return {
          badge: "secondary" as const,
          bg: "bg-orange-50",
          border: "border-orange-200",
          dot: "bg-orange-500",
        };
      case "low":
        return {
          badge: "outline" as const,
          bg: "bg-blue-50",
          border: "border-blue-200",
          dot: "bg-blue-500",
        };
      default:
        return {
          badge: "outline" as const,
          bg: "bg-muted/50",
          border: "border-border",
          dot: "bg-muted-foreground",
        };
    }
  };

  const getAlertTitle = (type: string, affectedArea?: string) => {
    const titles = {
      flood_warning: "Flood Warning",
      heavy_rain: "Heavy Rain Alert",
      dam_release: "Dam Release Alert",
    };
    return `${titles[type as keyof typeof titles] || "Alert"} - ${affectedArea || "Unknown Area"}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 border rounded-md">
              <Skeleton className="w-2 h-2 rounded-full mt-2" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="alerts-panel">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Active Alerts</span>
          {alerts.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8" data-testid="no-alerts">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const colors = getAlertColor(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-3 p-3 rounded-md border ${colors.bg} ${colors.border}`}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${colors.dot}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium flex items-center space-x-1">
                        {getAlertIcon(alert.type)}
                        <span>{getAlertTitle(alert.type, alert.affectedArea || undefined)}</span>
                      </p>
                      <Badge variant={colors.badge} className="text-xs ml-2">
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(alert.createdAt || new Date()), { addSuffix: true })}
                      </span>
                      {alert.validUntil && (
                        <span>
                          Valid until {new Date(alert.validUntil).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
