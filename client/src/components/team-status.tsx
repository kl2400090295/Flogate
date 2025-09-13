import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MapPin, Phone } from "lucide-react";
import type { ResponseTeam } from "@shared/schema";

export function TeamStatus() {
  const { data: teams = [], isLoading } = useQuery<ResponseTeam[]>({
    queryKey: ["/api/response-teams"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "standby":
        return "bg-warning";
      case "unavailable":
        return "bg-muted-foreground";
      default:
        return "bg-muted-foreground";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default" as const;
      case "standby":
        return "secondary" as const;
      case "unavailable":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const getTeamTypeLabel = (type: string) => {
    const labels = {
      relief_distribution: "Relief Distribution",
      medical_response: "Medical Response",
      evacuation: "Evacuation Support",
      standby: "Standby",
    };
    return labels[type as keyof typeof labels] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Response Teams</CardTitle>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="team-status">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Response Teams</span>
          </CardTitle>
          <Button 
            variant="secondary" 
            className="px-3 py-1 text-sm"
            data-testid="button-manage-teams"
          >
            Manage Teams
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {teams.length === 0 ? (
          <div className="text-center py-8" data-testid="no-teams">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No response teams available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                data-testid={`team-${team.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(team.status)}`} />
                  <div>
                    <p className="font-medium text-sm">{team.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(team.status)} className="text-xs">
                        {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getTeamTypeLabel(team.type)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm font-medium mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{team.currentLocation || "Base Camp"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{team.memberCount} members</span>
                    {team.contactNumber && (
                      <>
                        <Phone className="w-3 h-3" />
                        <span>{team.contactNumber}</span>
                      </>
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
