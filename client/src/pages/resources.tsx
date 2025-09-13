import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertResourceSchema, insertReliefDistributionSchema, type Resource, type InsertResource, type FloodZone, type ReliefDistribution } from "@shared/schema";
import { Package, Plus, Utensils, Pill, Home, Droplet, Shirt, Edit, Send } from "lucide-react";
import { z } from "zod";

const resourceFormSchema = insertResourceSchema.extend({
  totalQuantity: z.string().refine((val) => !isNaN(parseInt(val)), "Must be a valid number"),
  expiryDate: z.string().optional(),
});

const distributionFormSchema = insertReliefDistributionSchema.extend({
  quantity: z.string().refine((val) => !isNaN(parseInt(val)), "Must be a valid number"),
  recipientCount: z.string().optional().refine((val) => !val || !isNaN(parseInt(val)), "Must be a valid number"),
});

export default function Resources() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const { toast } = useToast();

  const { data: resources = [], isLoading: isResourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: floodZones = [] } = useQuery<FloodZone[]>({
    queryKey: ["/api/flood-zones"],
  });

  const { data: distributions = [], isLoading: isDistributionsLoading } = useQuery<ReliefDistribution[]>({
    queryKey: ["/api/relief-distribution"],
  });

  const resourceForm = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      type: "food",
      unit: "packets",
      totalQuantity: "",
      priority: "medium",
      location: "",
      expiryDate: "",
    },
  });

  const distributionForm = useForm<z.infer<typeof distributionFormSchema>>({
    resolver: zodResolver(distributionFormSchema),
    defaultValues: {
      resourceId: "",
      floodZoneId: "",
      quantity: "",
      distributedTo: "",
      recipientCount: "",
      notes: "",
      status: "completed",
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resourceFormSchema>) => {
      const resourceData: InsertResource = {
        ...data,
        totalQuantity: parseInt(data.totalQuantity),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      };
      return await apiRequest("POST", "/api/resources", resourceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsCreateDialogOpen(false);
      resourceForm.reset();
      toast({
        title: "Success",
        description: "Resource added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add resource",
        variant: "destructive",
      });
    },
  });

  const distributeResourceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof distributionFormSchema>) => {
      const distributionData = {
        ...data,
        quantity: parseInt(data.quantity),
        recipientCount: data.recipientCount ? parseInt(data.recipientCount) : undefined,
      };
      return await apiRequest("POST", "/api/relief-distribution", distributionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/relief-distribution"] });
      setIsDistributeDialogOpen(false);
      setSelectedResource(null);
      distributionForm.reset();
      toast({
        title: "Success",
        description: "Resource distributed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to distribute resource",
        variant: "destructive",
      });
    },
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "food":
        return <Utensils className="w-5 h-5" />;
      case "medical":
        return <Pill className="w-5 h-5" />;
      case "shelter":
        return <Home className="w-5 h-5" />;
      case "water":
        return <Droplet className="w-5 h-5" />;
      case "clothing":
        return <Shirt className="w-5 h-5" />;
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
        return "bg-orange-50 dark:bg-orange-900/20";
      case "low":
        return "bg-primary/10";
      default:
        return "bg-muted/50";
    }
  };

  const onCreateResource = (data: z.infer<typeof resourceFormSchema>) => {
    createResourceMutation.mutate(data);
  };

  const onDistributeResource = (data: z.infer<typeof distributionFormSchema>) => {
    distributeResourceMutation.mutate(data);
  };

  const openDistributeDialog = (resource: Resource) => {
    setSelectedResource(resource);
    distributionForm.setValue("resourceId", resource.id);
    setIsDistributeDialogOpen(true);
  };

  if (isResourcesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalResources = resources.reduce((sum, r) => sum + r.totalQuantity, 0);
  const totalDistributed = resources.reduce((sum, r) => sum + (r.distributedQuantity || 0), 0);
  const distributionPercentage = totalResources > 0 ? Math.round((totalDistributed / totalResources) * 100) : 0;

  return (
    <div className="p-6 space-y-6" data-testid="resources-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Management</h1>
          <p className="text-muted-foreground mt-1">
            Track inventory and manage distribution of relief supplies
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-resource">
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <Form {...resourceForm}>
              <form onSubmit={resourceForm.handleSubmit(onCreateResource)} className="space-y-4">
                <FormField
                  control={resourceForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Food Packets" {...field} data-testid="input-resource-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={resourceForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-resource-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="shelter">Shelter</SelectItem>
                            <SelectItem value="water">Water</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resourceForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. packets, pieces" {...field} data-testid="input-unit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={resourceForm.control}
                    name="totalQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1000" 
                            {...field}
                            data-testid="input-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resourceForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={resourceForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Central Warehouse" {...field} value={field.value || ""} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resourceForm.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-expiry-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-resource"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createResourceMutation.isPending}
                    data-testid="button-save-resource"
                  >
                    {createResourceMutation.isPending ? "Adding..." : "Add Resource"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold mt-1">{totalResources.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Across {resources.length} types</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Distributed</p>
                <p className="text-2xl font-bold mt-1">{totalDistributed.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{distributionPercentage}% of total</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold mt-1">{(totalResources - totalDistributed).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Ready for distribution</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resources List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Resource Inventory</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {resources.length === 0 ? (
                <div className="text-center py-12" data-testid="no-resources">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No resources available</p>
                  <p className="text-sm text-muted-foreground">Add resources to start tracking inventory</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resources.map((resource) => {
                    const distributedPercentage = resource.totalQuantity > 0 
                      ? Math.round(((resource.distributedQuantity || 0) / resource.totalQuantity) * 100)
                      : 0;
                    const availableQuantity = resource.totalQuantity - (resource.distributedQuantity || 0) - (resource.allocatedQuantity || 0);
                    
                    return (
                      <div
                        key={resource.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${getPriorityBgColor(resource.priority)}`}
                        data-testid={`resource-${resource.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPriorityBgColor(resource.priority)}`}>
                            {getResourceIcon(resource.type)}
                          </div>
                          <div>
                            <p className="font-medium">{resource.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={getPriorityColor(resource.priority)} className="text-xs">
                                {resource.priority} Priority
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {resource.type} • {resource.location || "No location"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {(resource.distributedQuantity || 0).toLocaleString()} / {resource.totalQuantity.toLocaleString()} {resource.unit}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={distributedPercentage} className="w-24 h-2" />
                            <span className="text-xs text-muted-foreground min-w-[3rem]">
                              {distributedPercentage}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDistributeDialog(resource)}
                              disabled={availableQuantity <= 0}
                              data-testid={`button-distribute-${resource.id}`}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Distribute
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
        </div>

        {/* Recent Distributions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Distributions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isDistributionsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : distributions.length === 0 ? (
                <div className="text-center py-8" data-testid="no-distributions">
                  <Send className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No distributions yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {distributions.slice(0, 10).map((distribution) => {
                    const resource = resources.find(r => r.id === distribution.resourceId);
                    return (
                      <div
                        key={distribution.id}
                        className="p-3 bg-muted/50 rounded-lg"
                        data-testid={`distribution-${distribution.id}`}
                      >
                        <p className="font-medium text-sm">
                          {distribution.quantity} {resource?.unit || 'units'} {resource?.name || 'Resource'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          To: {distribution.distributedTo || 'Unknown location'}
                        </p>
                        {distribution.recipientCount && (
                          <p className="text-xs text-muted-foreground">
                            Recipients: {distribution.recipientCount}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {distribution.distributionDate ? new Date(distribution.distributionDate).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribution Dialog */}
      <Dialog open={isDistributeDialogOpen} onOpenChange={setIsDistributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distribute Resource</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <Form {...distributionForm}>
              <form onSubmit={distributionForm.handleSubmit(onDistributeResource)} className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">{selectedResource.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Available: {(selectedResource.totalQuantity - (selectedResource.distributedQuantity || 0) - (selectedResource.allocatedQuantity || 0)).toLocaleString()} {selectedResource.unit}
                  </p>
                </div>

                <FormField
                  control={distributionForm.control}
                  name="floodZoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flood Zone (optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-flood-zone">
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={distributionForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            {...field}
                            data-testid="input-distribution-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={distributionForm.control}
                    name="recipientCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipients (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="50" 
                            {...field}
                            data-testid="input-recipient-count"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={distributionForm.control}
                  name="distributedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distributed To</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Community Center, Relief Camp" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-distributed-to"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={distributionForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about the distribution..." 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-distribution-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDistributeDialogOpen(false)}
                    data-testid="button-cancel-distribution"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={distributeResourceMutation.isPending}
                    data-testid="button-confirm-distribution"
                  >
                    {distributeResourceMutation.isPending ? "Distributing..." : "Distribute"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
