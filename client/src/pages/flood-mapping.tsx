import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Map, MapCircle } from "@/components/ui/map";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertFloodZoneSchema, type FloodZone, type InsertFloodZone } from "@shared/schema";
import { MapPin, Plus, AlertTriangle, Droplets, Eye } from "lucide-react";
import { z } from "zod";

const formSchema = insertFloodZoneSchema.extend({
  latitude: z.string().refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  longitude: z.string().refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  waterLevel: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Must be a valid number"),
  dangerMark: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Must be a valid number"),
});

export default function FloodMapping() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const { toast } = useToast();

  const { data: floodZones = [], isLoading } = useQuery<FloodZone[]>({
    queryKey: ["/api/flood-zones"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      district: "",
      latitude: "",
      longitude: "",
      riskLevel: "medium",
      radius: 1000,
      waterLevel: "",
      dangerMark: "",
      isActive: true,
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const zoneData: InsertFloodZone = {
        name: data.name,
        district: data.district,
        latitude: parseFloat(data.latitude).toString(),
        longitude: parseFloat(data.longitude).toString(),
        riskLevel: data.riskLevel,
        radius: data.radius,
        waterLevel: data.waterLevel ? parseFloat(data.waterLevel).toString() : null,
        dangerMark: data.dangerMark ? parseFloat(data.dangerMark).toString() : null,
        isActive: data.isActive,
      };
      return await apiRequest("POST", "/api/flood-zones", zoneData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flood-zones"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Flood zone created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create flood zone",
        variant: "destructive",
      });
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FloodZone> }) => {
      return await apiRequest("PATCH", `/api/flood-zones/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flood-zones"] });
      toast({
        title: "Success",
        description: "Flood zone updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update flood zone",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createZoneMutation.mutate(data);
  };

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

  const defaultCenter: [number, number] = [9.4981, 76.3388]; // Alappuzha, Kerala

  const toggleZoneActive = (zone: FloodZone) => {
    updateZoneMutation.mutate({
      id: zone.id,
      updates: { isActive: !zone.isActive }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="flood-mapping-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flood Zone Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage flood-affected areas with real-time risk assessment
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-zone">
              <Plus className="w-4 h-4 mr-2" />
              Add Flood Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Flood Zone</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Kuttanad Zone 1" {...field} data-testid="input-zone-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Alappuzha" {...field} data-testid="input-district" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="9.4981" {...field} data-testid="input-latitude" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="76.3388" {...field} data-testid="input-longitude" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-risk-level">
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="low">Low Risk</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="radius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Radius (meters)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-radius"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="waterLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Water Level (m)</FormLabel>
                        <FormControl>
                          <Input placeholder="2.5" {...field} data-testid="input-water-level" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dangerMark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danger Mark (m)</FormLabel>
                        <FormControl>
                          <Input placeholder="3.0" {...field} data-testid="input-danger-mark" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createZoneMutation.isPending}
                    data-testid="button-save-zone"
                  >
                    {createZoneMutation.isPending ? "Creating..." : "Create Zone"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Interactive Flood Map</span>
                </CardTitle>
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
              <div className="h-[600px]">
                <Map center={defaultCenter} zoom={10} data-testid="flood-zones-map">
                  {floodZones.map((zone) => (
                    <MapCircle
                      key={zone.id}
                      center={[parseFloat(zone.latitude), parseFloat(zone.longitude)]}
                      radius={zone.radius}
                      color={getRiskColor(zone.riskLevel)}
                      fillColor={getRiskColor(zone.riskLevel)}
                      fillOpacity={zone.isActive ? 0.3 : 0.1}
                      popup={`
                        <div>
                          <strong>${zone.name}</strong><br/>
                          District: ${zone.district}<br/>
                          Risk Level: <span style="color: ${getRiskColor(zone.riskLevel)}">${zone.riskLevel.toUpperCase()}</span><br/>
                          ${zone.waterLevel ? `Water Level: ${zone.waterLevel}m<br/>` : ''}
                          ${zone.dangerMark ? `Danger Mark: ${zone.dangerMark}m<br/>` : ''}
                          Status: ${zone.isActive ? 'Active' : 'Inactive'}
                        </div>
                      `}
                    />
                  ))}
                </Map>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zone List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Flood Zones</span>
                <Badge variant="secondary">{floodZones.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {floodZones.length === 0 ? (
                <div className="text-center py-8" data-testid="no-zones">
                  <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No flood zones defined</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {floodZones.map((zone) => (
                    <div
                      key={zone.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedZone?.id === zone.id 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-card hover:bg-muted/50'
                      } ${!zone.isActive ? 'opacity-60' : ''}`}
                      onClick={() => setSelectedZone(zone)}
                      data-testid={`zone-card-${zone.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{zone.name}</p>
                          <p className="text-xs text-muted-foreground">{zone.district}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant={getRiskBadgeVariant(zone.riskLevel)} 
                              className="text-xs"
                            >
                              {zone.riskLevel}
                            </Badge>
                            {!zone.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleZoneActive(zone);
                          }}
                          data-testid={`toggle-zone-${zone.id}`}
                        >
                          <Eye className={`w-3 h-3 ${zone.isActive ? 'text-success' : 'text-muted-foreground'}`} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone Details */}
          {selectedZone && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5" />
                  <span>Zone Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedZone.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">District</Label>
                  <p className="font-medium">{selectedZone.district}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Coordinates</Label>
                  <p className="font-medium">
                    {parseFloat(selectedZone.latitude).toFixed(4)}, {parseFloat(selectedZone.longitude).toFixed(4)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Risk Level</Label>
                  <Badge variant={getRiskBadgeVariant(selectedZone.riskLevel)} className="mt-1">
                    {selectedZone.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Radius</Label>
                  <p className="font-medium">{selectedZone.radius.toLocaleString()} meters</p>
                </div>
                {selectedZone.waterLevel && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Water Level</Label>
                    <p className="font-medium">{selectedZone.waterLevel}m</p>
                  </div>
                )}
                {selectedZone.dangerMark && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Danger Mark</Label>
                    <p className="font-medium">{selectedZone.dangerMark}m</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                  <p className="font-medium text-xs">
                    {selectedZone.lastUpdated ? new Date(selectedZone.lastUpdated).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
