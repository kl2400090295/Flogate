import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CloudRain, Wind, Droplets, Gauge } from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  pressure: number;
}

export function WeatherWidget({ location = "Alappuzha" }: { location?: string }) {
  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: ["/api/weather", location],
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Weather data unavailable
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Check API configuration
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPrecipitationStatus = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes("heavy") || desc.includes("storm")) {
      return { text: "Heavy Rain", color: "text-destructive" };
    }
    if (desc.includes("rain") || desc.includes("drizzle")) {
      return { text: "Rain", color: "text-warning" };
    }
    if (desc.includes("cloud")) {
      return { text: "Cloudy", color: "text-muted-foreground" };
    }
    return { text: "Fair", color: "text-success" };
  };

  const getWaterLevelStatus = (humidity: number) => {
    if (humidity > 80) {
      return { text: "Rising", color: "text-warning" };
    }
    if (humidity > 60) {
      return { text: "Stable", color: "text-muted-foreground" };
    }
    return { text: "Low", color: "text-success" };
  };

  const precipitation = getPrecipitationStatus(weather?.description || "");
  const waterLevel = getWaterLevelStatus(weather?.humidity || 0);

  return (
    <Card data-testid="weather-widget">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CloudRain className="w-5 h-5" />
          <span>Current Weather</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Temperature</span>
            <span className="font-medium" data-testid="temperature">
              {weather?.temperature ? `${Math.round(weather.temperature)}°C` : "N/A"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center space-x-1">
              <CloudRain className="w-4 h-4" />
              <span>Precipitation</span>
            </span>
            <span className={`font-medium ${precipitation.color}`} data-testid="precipitation">
              {precipitation.text}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center space-x-1">
              <Droplets className="w-4 h-4" />
              <span>Humidity</span>
            </span>
            <span className="font-medium" data-testid="humidity">
              {weather?.humidity ? `${weather.humidity}%` : "N/A"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Water Level</span>
            <span className={`font-medium ${waterLevel.color}`} data-testid="water-level">
              {waterLevel.text}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center space-x-1">
              <Wind className="w-4 h-4" />
              <span>Wind Speed</span>
            </span>
            <span className="font-medium" data-testid="wind-speed">
              {weather?.windSpeed ? `${Math.round(weather.windSpeed * 3.6)} km/h` : "N/A"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center space-x-1">
              <Gauge className="w-4 h-4" />
              <span>Pressure</span>
            </span>
            <span className="font-medium" data-testid="pressure">
              {weather?.pressure ? `${weather.pressure} hPa` : "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
