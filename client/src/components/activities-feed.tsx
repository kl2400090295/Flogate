import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, Package, Users, AlertTriangle, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog } from "@shared/schema";

export function ActivitiesFeed() {
  const { data: activities = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activities"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "distribution":
      case "relief_distribution":
        return <Package className="w-4 h-4" />;
      case "registration":
      case "population_registration":
        return <Users className="w-4 h-4" />;
      case "alert_creation":
      case "alert":
        return <AlertTriangle className="w-4 h-4" />;
      case "evacuation":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "distribution":
      case "relief_distribution":
        return "bg-success";
      case "registration":
      case "population_registration":
        return "bg-primary";
      case "alert_creation":
      case "alert":
        return "bg-warning";
      case "evacuation":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case "distribution":
      case "relief_distribution":
        return "default" as const;
      case "registration":
      case "population_registration":
        return "secondary" as const;
      case "alert_creation":
      case "alert":
        return "destructive" as const;
      case "evacuation":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="activities-feed">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Recent Activities</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8" data-testid="no-activities">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3"
                data-testid={`activity-${activity.id}`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium line-clamp-2">
                      {activity.description}
                    </p>
                    <Badge 
                      variant={getActivityBadgeVariant(activity.type)} 
                      className="text-xs ml-2 flex-shrink-0"
                    >
                      {getActivityIcon(activity.type)}
                      <span className="ml-1 capitalize">
                        {activity.type.replace(/_/g, ' ')}
                      </span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(activity.createdAt || new Date()), { addSuffix: true })}
                    </span>
                    {activity.location && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{activity.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
