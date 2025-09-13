import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FloodMap } from "@/components/flood-map";
import { WeatherWidget } from "@/components/weather-widget";
import { AlertsPanel } from "@/components/alerts-panel";
import { ResourceAllocation } from "@/components/resource-allocation";
import { PopulationChart } from "@/components/population-chart";
import { ActivitiesFeed } from "@/components/activities-feed";
import { TeamStatus } from "@/components/team-status";
import { AlertTriangle, Users, Package, Shield } from "lucide-react";

interface DashboardStats {
  activeZones: number;
  affectedPeople: number;
  reliefDistributed: number;
  responseTeams: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 60000, // Refetch every minute
  });

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    iconColor, 
    iconBg,
    testId
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    testId: string;
  }) => (
    <Card data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1`}>
              {isStatsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span data-testid={`${testId}-value`}>{value}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8" data-testid="dashboard">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Flood Zones"
          value={stats?.activeZones ?? "—"}
          subtitle="High-risk areas monitored"
          icon={AlertTriangle}
          iconColor="text-destructive"
          iconBg="bg-destructive/10"
          testId="stat-active-zones"
        />
        
        <StatCard
          title="Affected Population"
          value={stats?.affectedPeople ? stats.affectedPeople.toLocaleString() : "—"}
          subtitle="Verified registrations"
          icon={Users}
          iconColor="text-primary"
          iconBg="bg-primary/10"
          testId="stat-affected-population"
        />
        
        <StatCard
          title="Relief Distributed"
          value={stats?.reliefDistributed ? `${stats.reliefDistributed}%` : "—"}
          subtitle="of allocated resources"
          icon={Package}
          iconColor="text-success"
          iconBg="bg-success/10"
          testId="stat-relief-distributed"
        />
        
        <StatCard
          title="Response Teams"
          value={stats?.responseTeams ?? "—"}
          subtitle="Active and standby units"
          icon={Shield}
          iconColor="text-warning"
          iconBg="bg-warning/10"
          testId="stat-response-teams"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Flood Map */}
        <div className="lg:col-span-2">
          <FloodMap />
        </div>

        {/* Weather & Alerts */}
        <div className="space-y-6">
          <WeatherWidget />
          <AlertsPanel />
        </div>
      </div>

      {/* Resource Management & Population Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResourceAllocation />
        <PopulationChart />
      </div>

      {/* Recent Activities & Team Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivitiesFeed />
        <TeamStatus />
      </div>
    </div>
  );
}
