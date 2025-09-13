import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertFloodZoneSchema,
  insertAffectedPopulationSchema,
  insertResourceSchema,
  insertReliefDistributionSchema,
  insertWeatherAlertSchema,
  insertResponseTeamSchema,
  insertActivityLogSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Flood zones
  app.get("/api/flood-zones", isAuthenticated, async (req, res) => {
    try {
      const zones = await storage.getFloodZones();
      res.json(zones);
    } catch (error) {
      console.error("Error fetching flood zones:", error);
      res.status(500).json({ message: "Failed to fetch flood zones" });
    }
  });

  app.post("/api/flood-zones", isAuthenticated, async (req: any, res) => {
    try {
      const zoneData = insertFloodZoneSchema.parse(req.body);
      const zone = await storage.createFloodZone(zoneData);
      
      // Log activity
      await storage.logActivity({
        type: "zone_creation",
        description: `Created flood zone: ${zone.name}`,
        entityType: "flood_zone",
        entityId: zone.id,
        performedBy: req.user.claims.sub,
        location: zone.district,
      });

      res.json(zone);
    } catch (error) {
      console.error("Error creating flood zone:", error);
      res.status(500).json({ message: "Failed to create flood zone" });
    }
  });

  app.patch("/api/flood-zones/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const zone = await storage.updateFloodZone(id, updates);
      
      if (!zone) {
        return res.status(404).json({ message: "Flood zone not found" });
      }

      // Log activity
      await storage.logActivity({
        type: "zone_update",
        description: `Updated flood zone: ${zone.name}`,
        entityType: "flood_zone",
        entityId: zone.id,
        performedBy: req.user.claims.sub,
        location: zone.district,
        metadata: updates,
      });

      res.json(zone);
    } catch (error) {
      console.error("Error updating flood zone:", error);
      res.status(500).json({ message: "Failed to update flood zone" });
    }
  });

  // Affected population
  app.get("/api/population", isAuthenticated, async (req, res) => {
    try {
      const floodZoneId = req.query.floodZoneId as string;
      const population = await storage.getAffectedPopulation(floodZoneId);
      res.json(population);
    } catch (error) {
      console.error("Error fetching affected population:", error);
      res.status(500).json({ message: "Failed to fetch affected population" });
    }
  });

  app.post("/api/population", isAuthenticated, async (req: any, res) => {
    try {
      const personData = insertAffectedPopulationSchema.parse({
        ...req.body,
        registeredBy: req.user.claims.sub,
      });
      const person = await storage.createAffectedPerson(personData);
      
      // Log activity
      await storage.logActivity({
        type: "population_registration",
        description: `Registered affected person: ${person.name}`,
        entityType: "population",
        entityId: person.id,
        performedBy: req.user.claims.sub,
        location: person.address || "Unknown",
      });

      res.json(person);
    } catch (error) {
      console.error("Error registering affected person:", error);
      res.status(500).json({ message: "Failed to register affected person" });
    }
  });

  app.patch("/api/population/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const person = await storage.updateAffectedPerson(id, updates);
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }

      // Log activity
      await storage.logActivity({
        type: "population_update",
        description: `Updated affected person: ${person.name}`,
        entityType: "population",
        entityId: person.id,
        performedBy: req.user.claims.sub,
        metadata: updates,
      });

      res.json(person);
    } catch (error) {
      console.error("Error updating affected person:", error);
      res.status(500).json({ message: "Failed to update affected person" });
    }
  });

  // Resources
  app.get("/api/resources", isAuthenticated, async (req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.post("/api/resources", isAuthenticated, async (req: any, res) => {
    try {
      const resourceData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(resourceData);
      
      // Log activity
      await storage.logActivity({
        type: "resource_creation",
        description: `Added resource: ${resource.name} (${resource.totalQuantity} ${resource.unit})`,
        entityType: "resource",
        entityId: resource.id,
        performedBy: req.user.claims.sub,
        location: resource.location || "Central Store",
      });

      res.json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  app.patch("/api/resources/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const resource = await storage.updateResource(id, updates);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Log activity
      await storage.logActivity({
        type: "resource_update",
        description: `Updated resource: ${resource.name}`,
        entityType: "resource",
        entityId: resource.id,
        performedBy: req.user.claims.sub,
        metadata: updates,
      });

      res.json(resource);
    } catch (error) {
      console.error("Error updating resource:", error);
      res.status(500).json({ message: "Failed to update resource" });
    }
  });

  // Relief distribution
  app.get("/api/relief-distribution", isAuthenticated, async (req, res) => {
    try {
      const floodZoneId = req.query.floodZoneId as string;
      const distributions = await storage.getReliefDistributions(floodZoneId);
      res.json(distributions);
    } catch (error) {
      console.error("Error fetching relief distributions:", error);
      res.status(500).json({ message: "Failed to fetch relief distributions" });
    }
  });

  app.post("/api/relief-distribution", isAuthenticated, async (req: any, res) => {
    try {
      const distributionData = insertReliefDistributionSchema.parse({
        ...req.body,
        distributedBy: req.user.claims.sub,
      });
      const distribution = await storage.createReliefDistribution(distributionData);
      
      // Log activity
      await storage.logActivity({
        type: "relief_distribution",
        description: `Distributed relief: ${distribution.quantity} units to ${distribution.distributedTo}`,
        entityType: "distribution",
        entityId: distribution.id,
        performedBy: req.user.claims.sub,
        location: distribution.distributedTo || "Unknown",
      });

      res.json(distribution);
    } catch (error) {
      console.error("Error creating relief distribution:", error);
      res.status(500).json({ message: "Failed to create relief distribution" });
    }
  });

  // Weather alerts
  app.get("/api/weather-alerts", isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getActiveWeatherAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching weather alerts:", error);
      res.status(500).json({ message: "Failed to fetch weather alerts" });
    }
  });

  app.post("/api/weather-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const alertData = insertWeatherAlertSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      const alert = await storage.createWeatherAlert(alertData);
      
      // Log activity
      await storage.logActivity({
        type: "alert_creation",
        description: `Created ${alert.severity} alert: ${alert.title}`,
        entityType: "alert",
        entityId: alert.id,
        performedBy: req.user.claims.sub,
        location: alert.affectedArea || "Unknown",
      });

      res.json(alert);
    } catch (error) {
      console.error("Error creating weather alert:", error);
      res.status(500).json({ message: "Failed to create weather alert" });
    }
  });

  app.delete("/api/weather-alerts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deactivateWeatherAlert(id);
      
      // Log activity
      await storage.logActivity({
        type: "alert_deactivation",
        description: `Deactivated weather alert`,
        entityType: "alert",
        entityId: id,
        performedBy: req.user.claims.sub,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating weather alert:", error);
      res.status(500).json({ message: "Failed to deactivate weather alert" });
    }
  });

  // Response teams
  app.get("/api/response-teams", isAuthenticated, async (req, res) => {
    try {
      const teams = await storage.getResponseTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching response teams:", error);
      res.status(500).json({ message: "Failed to fetch response teams" });
    }
  });

  app.post("/api/response-teams", isAuthenticated, async (req: any, res) => {
    try {
      const teamData = insertResponseTeamSchema.parse({
        ...req.body,
        leadOfficer: req.user.claims.sub,
      });
      const team = await storage.createResponseTeam(teamData);
      
      // Log activity
      await storage.logActivity({
        type: "team_creation",
        description: `Created response team: ${team.name}`,
        entityType: "team",
        entityId: team.id,
        performedBy: req.user.claims.sub,
        location: team.currentLocation || "Base",
      });

      res.json(team);
    } catch (error) {
      console.error("Error creating response team:", error);
      res.status(500).json({ message: "Failed to create response team" });
    }
  });

  app.patch("/api/response-teams/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const team = await storage.updateResponseTeam(id, updates);
      
      if (!team) {
        return res.status(404).json({ message: "Response team not found" });
      }

      // Log activity
      await storage.logActivity({
        type: "team_update",
        description: `Updated response team: ${team.name}`,
        entityType: "team",
        entityId: team.id,
        performedBy: req.user.claims.sub,
        metadata: updates,
      });

      res.json(team);
    } catch (error) {
      console.error("Error updating response team:", error);
      res.status(500).json({ message: "Failed to update response team" });
    }
  });

  // Activity log
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Weather data integration (OpenWeatherMap API)
  app.get("/api/weather/:location", isAuthenticated, async (req, res) => {
    try {
      const { location } = req.params;
      const apiKey = process.env.OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "Weather API key not configured" });
      }

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );

      if (!weatherResponse.ok) {
        throw new Error(`Weather API returned ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();
      res.json({
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        description: weatherData.weather[0].description,
        windSpeed: weatherData.wind.speed,
        pressure: weatherData.main.pressure,
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
