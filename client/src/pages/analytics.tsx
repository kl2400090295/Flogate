import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { BarChart3, TrendingUp, Users, Package, MapPin, AlertTriangle } from "lucide-react";
import type { FloodZone, AffectedPopulation, Resource, ReliefDistribution } from "@shared/schema";

export default function Analytics() {
  const { data: floodZones = [], isLoading: isZonesLoading } = useQuery<FloodZone[]>({
    queryKey: ["/api/flood-zones"],
  });

  const { data: population = [], isLoading: isPopulationLoading } = useQuery<AffectedPopulation[]>({
    queryKey: ["/api/population"],
  });

  const { data: resources = [], isLoading: isResourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: distributions = [], isLoading: isDistributionsLoading } = useQuery<ReliefDistribution[]>({
    queryKey: ["/api/relief-distribution"],
  });

  const isLoading = isZonesLoading || isPopulationLoading || isResourcesLoading || isDistributionsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-lg" />
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalResources = resources.reduce((sum, r) => sum + r.totalQuantity, 0);
  const totalDistributed = resources.reduce((sum, r) => sum + (r.distributedQuantity || 0), 0);
  const totalPeople = population.reduce((sum, p) => sum + (p.familyMembers || 1), 0);
  const distributionEfficiency = totalResources > 0 ? Math.round((totalDistributed / totalResources) * 100) : 0;

  // Prepare data for charts

  // Zone risk distribution
  const riskData = floodZones.reduce((acc, zone) => {
    acc[zone.riskLevel] = (acc[zone.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskChartData = Object.entries(riskData).map(([risk, count]) => ({
    name: risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk',
    value: count,
    color: risk === 'high' ? '#dc2626' : risk === 'medium' ? '#ea580c' : '#16a34a',
  }));

  // Population by evacuation status
  const statusData = population.reduce((acc, person) => {
    acc[person.evacuationStatus] = (acc[person.evacuationStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count,
    color: getStatusColor(status),
  }));

  // Resource distribution by type
  const resourceTypeData = resources.reduce((acc, resource) => {
    const type = resource.type;
    if (!acc[type]) {
      acc[type] = { total: 0, distributed: 0 };
    }
    acc[type].total += resource.totalQuantity;
    acc[type].distributed += (resource.distributedQuantity || 0);
    return acc;
  }, {} as Record<string, { total: number; distributed: number }>);

  const resourceChartData = Object.entries(resourceTypeData).map(([type, data]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    total: data.total,
    distributed: data.distributed,
    available: data.total - data.distributed,
  }));

  // Distribution timeline (mock data for demonstration)
  const timelineData = distributions
    .slice(0, 10)
    .map((dist, index) => ({
      date: dist.distributionDate ? new Date(dist.distributionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
      distributed: dist.quantity,
      cumulative: distributions.slice(0, index + 1).reduce((sum, d) => sum + d.quantity, 0),
    }))
    .reverse();

  // District-wise population
  const districtData = population.reduce((acc, person) => {
    const zone = floodZones.find(z => z.id === person.floodZoneId);
    const district = zone?.district || 'Unknown';
    acc[district] = (acc[district] || 0) + (person.familyMembers || 1);
    return acc;
  }, {} as Record<string, number>);

  const districtChartData = Object.entries(districtData)
    .map(([district, count]) => ({ district, population: count }))
    .sort((a, b) => b.population - a.population)
    .slice(0, 10);

  function getStatusColor(status: string) {
    switch (status) {
      case "evacuated":
        return "#3b82f6"; // blue
      case "sheltered":
        return "#16a34a"; // green  
      case "at_risk":
        return "#dc2626"; // red
      case "safe":
        return "#ea580c"; // orange
      default:
        return "#6b7280"; // gray
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6" data-testid="analytics-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Data insights and trends for disaster management operations
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Zones</p>
                <p className="text-2xl font-bold mt-1" data-testid="metric-active-zones">
                  {floodZones.filter(z => z.isActive).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">of {floodZones.length} total</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Population</p>
                <p className="text-2xl font-bold mt-1" data-testid="metric-total-population">
                  {totalPeople.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{population.length} registered</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resources Distributed</p>
                <p className="text-2xl font-bold mt-1" data-testid="metric-resources-distributed">
                  {distributionEfficiency}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{totalDistributed.toLocaleString()} of {totalResources.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Distribution Events</p>
                <p className="text-2xl font-bold mt-1" data-testid="metric-distributions">
                  {distributions.length}
                </p>
                <p className="text-xs text-success mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  Recent activity
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Risk Level Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {riskChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No flood zones data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Population by Evacuation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Population by Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No population data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resource Distribution by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Resource Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {resourceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="distributed" stackId="a" fill="#16a34a" name="Distributed" />
                    <Bar dataKey="available" stackId="a" fill="#e5e7eb" name="Available" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No resource data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribution Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Distribution Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      name="Cumulative Distributed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No distribution timeline data
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* District-wise Population */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Population by District</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {districtChartData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {districtChartData.map((item, index) => (
                <div
                  key={item.district}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  data-testid={`district-${item.district.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div>
                    <p className="font-medium">{item.district}</p>
                    <p className="text-sm text-muted-foreground">District</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {item.population.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">people</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No district data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Zones</p>
                <p className="text-2xl font-bold text-destructive mt-1">
                  {floodZones.filter(z => z.riskLevel === 'high').length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
              </div>
              <Badge variant="destructive">Critical</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">People At Risk</p>
                <p className="text-2xl font-bold text-warning mt-1">
                  {population.filter(p => p.evacuationStatus === 'at_risk').reduce((sum, p) => sum + (p.familyMembers || 1), 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Need evacuation support</p>
              </div>
              <Badge variant="secondary">Alert</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successfully Evacuated</p>
                <p className="text-2xl font-bold text-success mt-1">
                  {population.filter(p => p.evacuationStatus === 'evacuated' || p.evacuationStatus === 'sheltered').reduce((sum, p) => sum + (p.familyMembers || 1), 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Safe and accounted for</p>
              </div>
              <Badge variant="default">Safe</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
