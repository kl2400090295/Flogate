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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertAffectedPopulationSchema, type AffectedPopulation, type InsertAffectedPopulation, type FloodZone } from "@shared/schema";
import { Users, Plus, MapPin, Phone, Calendar, User, Heart, Home } from "lucide-react";
import { z } from "zod";

const formSchema = insertAffectedPopulationSchema.extend({
  latitude: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Must be a valid number"),
  longitude: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Must be a valid number"),
  age: z.string().optional().refine((val) => !val || !isNaN(parseInt(val)), "Must be a valid number"),
  familyMembers: z.string().refine((val) => !isNaN(parseInt(val)), "Must be a valid number"),
});

export default function Population() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<AffectedPopulation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: population = [], isLoading } = useQuery<AffectedPopulation[]>({
    queryKey: ["/api/population"],
  });

  const { data: floodZones = [] } = useQuery<FloodZone[]>({
    queryKey: ["/api/flood-zones"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      phoneNumber: "",
      address: "",
      latitude: "",
      longitude: "",
      floodZoneId: "",
      evacuationStatus: "at_risk",
      medicalNeeds: "",
      familyMembers: "1",
    },
  });

  const createPersonMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const personData: InsertAffectedPopulation = {
        ...data,
        age: data.age ? parseInt(data.age) : undefined,
        latitude: data.latitude ? data.latitude : undefined,
        longitude: data.longitude ? data.longitude : undefined,
        familyMembers: parseInt(data.familyMembers),
      };
      return await apiRequest("POST", "/api/population", personData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/population"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Person registered successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register person",
        variant: "destructive",
      });
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AffectedPopulation> }) => {
      return await apiRequest("PATCH", `/api/population/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/population"] });
      toast({
        title: "Success",
        description: "Person updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update person",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createPersonMutation.mutate(data);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "evacuated":
        return "default" as const;
      case "sheltered":
        return "secondary" as const;
      case "at_risk":
        return "destructive" as const;
      case "safe":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "evacuated":
        return <MapPin className="w-3 h-3" />;
      case "sheltered":
        return <Home className="w-3 h-3" />;
      case "at_risk":
        return <Users className="w-3 h-3" />;
      case "safe":
        return <Heart className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const updateEvacuationStatus = (person: AffectedPopulation, newStatus: string) => {
    updatePersonMutation.mutate({
      id: person.id,
      updates: { evacuationStatus: newStatus }
    });
  };

  // Filter population based on status
  const filteredPopulation = statusFilter === "all" 
    ? population 
    : population.filter(p => p.evacuationStatus === statusFilter);

  // Calculate statistics
  const stats = {
    total: population.length,
    evacuated: population.filter(p => p.evacuationStatus === "evacuated").length,
    sheltered: population.filter(p => p.evacuationStatus === "sheltered").length,
    atRisk: population.filter(p => p.evacuationStatus === "at_risk").length,
    safe: population.filter(p => p.evacuationStatus === "safe").length,
    totalFamilyMembers: population.reduce((sum, p) => sum + (p.familyMembers || 1), 0),
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="population-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Population Registry</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage affected population with evacuation status
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-register-person">
              <Plus className="w-4 h-4 mr-2" />
              Register Person
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register Affected Person</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="35" {...field} data-testid="input-age" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} value={field.value || ""} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full address..." {...field} value={field.value || ""} data-testid="input-address" />
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
                        <FormLabel>Latitude (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="9.4981" {...field} data-testid="input-person-latitude" />
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
                        <FormLabel>Longitude (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="76.3388" {...field} data-testid="input-person-longitude" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="floodZoneId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flood Zone (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-person-flood-zone">
                              <SelectValue placeholder="Select flood zone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No specific zone</SelectItem>
                            {floodZones.map((zone) => (
                              <SelectItem key={zone.id} value={zone.id}>
                                {zone.name} - {zone.district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evacuationStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evacuation Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-evacuation-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="at_risk">At Risk</SelectItem>
                            <SelectItem value="evacuated">Evacuated</SelectItem>
                            <SelectItem value="sheltered">In Shelter</SelectItem>
                            <SelectItem value="safe">Safe</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="familyMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Members *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field}
                          data-testid="input-family-members"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Needs (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any medical conditions or special needs..." 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-medical-needs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-person"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPersonMutation.isPending}
                    data-testid="button-save-person"
                  >
                    {createPersonMutation.isPending ? "Registering..." : "Register Person"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Registered</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.evacuated}</p>
              <p className="text-xs text-muted-foreground">Evacuated</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{stats.sheltered}</p>
              <p className="text-xs text-muted-foreground">In Shelters</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{stats.atRisk}</p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{stats.totalFamilyMembers}</p>
              <p className="text-xs text-muted-foreground">Total People</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Population List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Registered Population</span>
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="filter-evacuation-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="evacuated">Evacuated</SelectItem>
                <SelectItem value="sheltered">In Shelters</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPopulation.length === 0 ? (
            <div className="text-center py-12" data-testid="no-population">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No registered population</p>
              <p className="text-sm text-muted-foreground">Register people to start tracking evacuation status</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPopulation.map((person) => {
                const floodZone = person.floodZoneId 
                  ? floodZones.find(z => z.id === person.floodZoneId) 
                  : null;
                
                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                    data-testid={`person-${person.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          {person.age && <span>{person.age} years</span>}
                          {person.gender && <span>• {person.gender}</span>}
                          {person.familyMembers && person.familyMembers > 1 && (
                            <span>• Family of {person.familyMembers}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getStatusBadgeVariant(person.evacuationStatus)} className="text-xs">
                            {getStatusIcon(person.evacuationStatus)}
                            <span className="ml-1 capitalize">
                              {person.evacuationStatus.replace('_', ' ')}
                            </span>
                          </Badge>
                          {floodZone && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {floodZone.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        {person.phoneNumber && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{person.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Select
                          value={person.evacuationStatus}
                          onValueChange={(value) => updateEvacuationStatus(person, value)}
                          disabled={updatePersonMutation.isPending}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs" data-testid={`status-select-${person.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="at_risk">At Risk</SelectItem>
                            <SelectItem value="evacuated">Evacuated</SelectItem>
                            <SelectItem value="sheltered">In Shelter</SelectItem>
                            <SelectItem value="safe">Safe</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPerson(person)}
                          data-testid={`view-person-${person.id}`}
                        >
                          <Calendar className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Person Details Dialog */}
      {selectedPerson && (
        <Dialog open={!!selectedPerson} onOpenChange={() => setSelectedPerson(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Person Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedPerson.name}</p>
                </div>
                {selectedPerson.age && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Age</Label>
                    <p className="font-medium">{selectedPerson.age} years</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedPerson.gender && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Gender</Label>
                    <p className="font-medium capitalize">{selectedPerson.gender}</p>
                  </div>
                )}
                {selectedPerson.phoneNumber && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedPerson.phoneNumber}</p>
                  </div>
                )}
              </div>

              {selectedPerson.address && (
                <div>
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <p className="font-medium">{selectedPerson.address}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Evacuation Status</Label>
                  <Badge variant={getStatusBadgeVariant(selectedPerson.evacuationStatus)} className="mt-1">
                    {getStatusIcon(selectedPerson.evacuationStatus)}
                    <span className="ml-1 capitalize">
                      {selectedPerson.evacuationStatus.replace('_', ' ')}
                    </span>
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Family Members</Label>
                  <p className="font-medium">{selectedPerson.familyMembers || 1}</p>
                </div>
              </div>

              {selectedPerson.medicalNeeds && (
                <div>
                  <Label className="text-xs text-muted-foreground">Medical Needs</Label>
                  <p className="font-medium">{selectedPerson.medicalNeeds}</p>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Registered On</Label>
                <p className="font-medium">
                  {selectedPerson.createdAt ? new Date(selectedPerson.createdAt).toLocaleDateString() : 'Unknown date'}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
