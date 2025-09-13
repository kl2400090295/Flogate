import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Users } from "lucide-react";
import type { AffectedPopulation } from "@shared/schema";

const EVACUATION_COLORS = {
  evacuated: "#3b82f6", // blue
  sheltered: "#16a34a", // green  
  at_risk: "#dc2626", // red
  safe: "#ea580c", // orange
};

export function PopulationChart() {
  const { data: population = [], isLoading } = useQuery<AffectedPopulation[]>({
    queryKey: ["/api/population"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle>Population Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="w-48 h-48 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group population by evacuation status
  const statusCounts = population.reduce((acc, person) => {
    acc[person.evacuationStatus] = (acc[person.evacuationStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: EVACUATION_COLORS[status as keyof typeof EVACUATION_COLORS] || "#6b7280",
  }));

  // Add family members to total count
  const totalPeople = population.reduce((sum, person) => sum + (person.familyMembers || 1), 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} people ({((data.value / population.length) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card data-testid="population-chart">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Population Impact Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {population.length === 0 ? (
          <div className="h-64 flex items-center justify-center" data-testid="no-population-data">
            <div className="text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No population data available</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        data-testid={`pie-segment-${entry.name.toLowerCase().replace(' ', '-')}`}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '12px'
                    }}
                    formatter={(value: string) => (
                      <span className="text-xs">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground" data-testid="total-registered">
                  {population.length.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Registered Individuals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground" data-testid="total-people">
                  {totalPeople.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total People (incl. families)</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
