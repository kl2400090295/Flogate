import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, Pill, Home, Utensils } from "lucide-react";
import type { Resource } from "@shared/schema";

export function ResourceAllocation() {
  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "food":
        return <Utensils className="w-5 h-5" />;
      case "medical":
        return <Pill className="w-5 h-5" />;
      case "shelter":
        return <Home className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "secondary" as const;
      case "low":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10";
      case "medium":
        return "bg-orange-50";
      case "low":
        return "bg-primary/10";
      default:
        return "bg-muted/50";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-success";
    if (percentage >= 50) return "bg-warning";
    return "bg-destructive";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Resource Allocation</CardTitle>
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="resource-allocation">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Resource Allocation</span>
          </CardTitle>
          <Button 
            className="px-3 py-1 text-sm" 
            data-testid="button-manage-resources"
          >
            Manage Resources
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {resources.length === 0 ? (
          <div className="text-center py-8" data-testid="no-resources">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No resources available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.slice(0, 6).map((resource) => {
              const distributedPercentage = resource.totalQuantity > 0 
                ? Math.round(((resource.distributedQuantity || 0) / resource.totalQuantity) * 100)
                : 0;
              
              return (
                <div
                  key={resource.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${getPriorityBgColor(resource.priority)}`}
                  data-testid={`resource-${resource.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPriorityBgColor(resource.priority)}`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(resource.priority)} className="text-xs">
                          {resource.priority} Priority
                        </Badge>
                        {resource.location && (
                          <span className="text-xs text-muted-foreground">
                            @ {resource.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {(resource.distributedQuantity || 0).toLocaleString()} / {resource.totalQuantity.toLocaleString()} {resource.unit}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress 
                        value={distributedPercentage} 
                        className="w-20 h-2"
                      />
                      <span className="text-xs text-muted-foreground min-w-[3rem]">
                        {distributedPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {resources.length > 6 && (
              <div className="text-center pt-2">
                <Button variant="ghost" className="text-sm" data-testid="button-view-all-resources">
                  View all {resources.length} resources
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
