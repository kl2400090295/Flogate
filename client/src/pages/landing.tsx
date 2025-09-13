import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Waves, 
  MapPin, 
  Users, 
  Shield, 
  AlertTriangle,
  BarChart3 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100" data-testid="landing-page">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <Waves className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">FloodWatch</h1>
                <p className="text-sm text-muted-foreground">Disaster Management System</p>
              </div>
            </div>
            
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            Real-time Disaster Management Platform
          </Badge>
          
          <h2 className="text-5xl font-bold text-foreground mb-6 leading-tight">
            Comprehensive Flood Relief & 
            <span className="text-primary"> Risk Management</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Monitor flood zones in real-time, optimize resource distribution, and coordinate relief efforts 
            across districts with our comprehensive disaster management platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <Button 
              size="lg" 
              variant="outline"
              data-testid="learn-more-button"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Powerful Tools for Disaster Response
            </h3>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage flood relief operations effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Flood Mapping */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Interactive Flood Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Real-time visualization of flood-affected areas with risk zone identification 
                  and water level monitoring using geospatial data integration.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Live flood zone boundaries</li>
                  <li>• Water level tracking</li>
                  <li>• Risk assessment overlays</li>
                </ul>
              </CardContent>
            </Card>

            {/* Resource Management */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-600/5">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Resource Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Optimize distribution of food, medical supplies, and shelter resources 
                  based on priority and availability across affected zones.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Inventory tracking</li>
                  <li>• Priority-based allocation</li>
                  <li>• Distribution monitoring</li>
                </ul>
              </CardContent>
            </Card>

            {/* Population Registry */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-purple-600/5">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Population Registry</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Comprehensive database of affected population with location tracking, 
                  evacuation status, and needs assessment for targeted relief efforts.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Evacuation status tracking</li>
                  <li>• Medical needs assessment</li>
                  <li>• Family unit management</li>
                </ul>
              </CardContent>
            </Card>

            {/* Weather Integration */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500/5 to-orange-600/5">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Weather Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Real-time weather data integration with automated alert system for 
                  heavy rainfall, flood warnings, and dam release notifications.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Live weather monitoring</li>
                  <li>• Automated alert system</li>
                  <li>• Early warning notifications</li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-indigo-500/5 to-indigo-600/5">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Data Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Comprehensive analytics and reporting tools for flood patterns, 
                  resource utilization, and relief effectiveness analysis.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Resource utilization metrics</li>
                  <li>• Population impact analysis</li>
                  <li>• Relief effectiveness reports</li>
                </ul>
              </CardContent>
            </Card>

            {/* Collaboration */}
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-500/5 to-red-600/5">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Multi-user platform enabling collaboration between district authorities, 
                  NGOs, and field workers with role-based access control.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Role-based access control</li>
                  <li>• Team coordination tools</li>
                  <li>• Activity tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary/5 border-t border-border">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Ready to Transform Disaster Response?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Join district authorities and relief organizations using FloodWatch to save lives 
              and optimize relief operations during flood emergencies.
            </p>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Waves className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">FloodWatch</p>
                <p className="text-xs text-muted-foreground">Disaster Management System</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FloodWatch. Built for emergency response and disaster relief.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
