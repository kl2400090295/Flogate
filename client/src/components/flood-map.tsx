import { useQuery } from "@tanstack/react-query";
import { Map, MapCircle } from "@/components/ui/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { FloodZone } from "@shared/schema";

export function FloodMap() {
  const { data: floodZones = [], isLoading } = useQuery<FloodZone[]>({
    queryKey: ["/api/flood-zones"],
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Real-time Flood Map</CardTitle>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "#dc2626"; // red
      case "medium":
        return "#ea580c"; // orange
      case "low":
        return "#16a34a"; // green
      default:
        return "#6b7280"; // gray
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "destructive" as const;
      case "medium":
        return "secondary" as const;
      case "low":
        return "default" as const;
      default:
        return "outline" as const;
    }
  };

  // Use Alappuzha, Kerala as default center
  const defaultCenter: [number, number] = [9.4981, 76.3388];

  return (
    <Card className="h-full" data-testid="flood-map-container">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Real-time Flood Map</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              <span className="text-xs text-muted-foreground">High Risk</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Medium Risk</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Low Risk</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 relative">
          <Map center={defaultCenter} zoom={10} data-testid="flood-map">
            {floodZones.map((zone) => (
              <MapCircle
                key={zone.id}
                center={[parseFloat(zone.latitude), parseFloat(zone.longitude)]}
                radius={zone.radius}
                color={getRiskColor(zone.riskLevel)}
                fillColor={getRiskColor(zone.riskLevel)}
                fillOpacity={0.3}
                popup={`
                  <div>
                    <strong>${zone.name}</strong><br/>
                    District: ${zone.district}<br/>
                    Risk Level: <span style="color: ${getRiskColor(zone.riskLevel)}">${zone.riskLevel.toUpperCase()}</span><br/>
                    ${zone.waterLevel ? `Water Level: ${zone.waterLevel}m<br/>` : ''}
                    ${zone.dangerMark ? `Danger Mark: ${zone.dangerMark}m` : ''}
                  </div>
                `}
              />
            ))}
          </Map>
          
          {/* Zone list overlay */}
          {floodZones.length > 0 && (
            <div className="absolute top-4 right-4 max-w-xs bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg p-4">
              <h3 className="font-medium text-sm mb-2">Active Flood Zones</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {floodZones.slice(0, 5).map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium truncate">{zone.name}</span>
                    <Badge variant={getRiskBadgeVariant(zone.riskLevel)} className="text-xs">
                      {zone.riskLevel}
                    </Badge>
                  </div>
                ))}
                {floodZones.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{floodZones.length - 5} more zones
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
