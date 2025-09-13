import {
  users,
  floodZones,
  affectedPopulation,
  resources,
  reliefDistribution,
  weatherAlerts,
  responseTeams,
  activityLog,
  type User,
  type UpsertUser,
  type FloodZone,
  type InsertFloodZone,
  type AffectedPopulation,
  type InsertAffectedPopulation,
  type Resource,
  type InsertResource,
  type ReliefDistribution,
  type InsertReliefDistribution,
  type WeatherAlert,
  type InsertWeatherAlert,
  type ResponseTeam,
  type InsertResponseTeam,
  type ActivityLog,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Flood zone operations
  getFloodZones(): Promise<FloodZone[]>;
  getFloodZone(id: string): Promise<FloodZone | undefined>;
  createFloodZone(zone: InsertFloodZone): Promise<FloodZone>;
  updateFloodZone(id: string, zone: Partial<InsertFloodZone>): Promise<FloodZone | undefined>;

  // Affected population operations
  getAffectedPopulation(floodZoneId?: string): Promise<AffectedPopulation[]>;
  createAffectedPerson(person: InsertAffectedPopulation): Promise<AffectedPopulation>;
  updateAffectedPerson(id: string, updates: Partial<InsertAffectedPopulation>): Promise<AffectedPopulation | undefined>;

  // Resource operations
  getResources(): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, updates: Partial<InsertResource>): Promise<Resource | undefined>;

  // Relief distribution operations
  getReliefDistributions(floodZoneId?: string): Promise<ReliefDistribution[]>;
  createReliefDistribution(distribution: InsertReliefDistribution): Promise<ReliefDistribution>;

  // Weather alerts operations
  getActiveWeatherAlerts(): Promise<WeatherAlert[]>;
  createWeatherAlert(alert: InsertWeatherAlert): Promise<WeatherAlert>;
  deactivateWeatherAlert(id: string): Promise<void>;

  // Response teams operations
  getResponseTeams(): Promise<ResponseTeam[]>;
  createResponseTeam(team: InsertResponseTeam): Promise<ResponseTeam>;
  updateResponseTeam(id: string, updates: Partial<InsertResponseTeam>): Promise<ResponseTeam | undefined>;

  // Activity log operations
  getRecentActivities(limit?: number): Promise<ActivityLog[]>;
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;

  // Dashboard statistics
  getDashboardStats(): Promise<{
    activeZones: number;
    affectedPeople: number;
    reliefDistributed: number;
    responseTeams: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Flood zone operations
  async getFloodZones(): Promise<FloodZone[]> {
    return await db.select().from(floodZones).orderBy(desc(floodZones.lastUpdated));
  }

  async getFloodZone(id: string): Promise<FloodZone | undefined> {
    const [zone] = await db.select().from(floodZones).where(eq(floodZones.id, id));
    return zone;
  }

  async createFloodZone(zone: InsertFloodZone): Promise<FloodZone> {
    console.log("Creating flood zone with data:", zone);
    const [newZone] = await db.insert(floodZones).values(zone).returning();
    return newZone;
  }

  async updateFloodZone(id: string, zone: Partial<InsertFloodZone>): Promise<FloodZone | undefined> {
    const [updated] = await db
      .update(floodZones)
      .set({ ...zone, lastUpdated: new Date() })
      .where(eq(floodZones.id, id))
      .returning();
    return updated;
  }

  // Affected population operations
  async getAffectedPopulation(floodZoneId?: string): Promise<AffectedPopulation[]> {
    if (floodZoneId) {
      return await db
        .select()
        .from(affectedPopulation)
        .where(eq(affectedPopulation.floodZoneId, floodZoneId))
        .orderBy(desc(affectedPopulation.createdAt));
    }
    return await db.select().from(affectedPopulation).orderBy(desc(affectedPopulation.createdAt));
  }

  async createAffectedPerson(person: InsertAffectedPopulation): Promise<AffectedPopulation> {
    const [newPerson] = await db.insert(affectedPopulation).values(person).returning();
    return newPerson;
  }

  async updateAffectedPerson(
    id: string,
    updates: Partial<InsertAffectedPopulation>
  ): Promise<AffectedPopulation | undefined> {
    const [updated] = await db
      .update(affectedPopulation)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(affectedPopulation.id, id))
      .returning();
    return updated;
  }

  // Resource operations
  async getResources(): Promise<Resource[]> {
    return await db.select().from(resources).orderBy(desc(resources.updatedAt));
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async updateResource(id: string, updates: Partial<InsertResource>): Promise<Resource | undefined> {
    const [updated] = await db
      .update(resources)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
    return updated;
  }

  // Relief distribution operations
  async getReliefDistributions(floodZoneId?: string): Promise<ReliefDistribution[]> {
    if (floodZoneId) {
      return await db
        .select()
        .from(reliefDistribution)
        .where(eq(reliefDistribution.floodZoneId, floodZoneId))
        .orderBy(desc(reliefDistribution.distributionDate));
    }
    return await db.select().from(reliefDistribution).orderBy(desc(reliefDistribution.distributionDate));
  }

  async createReliefDistribution(distribution: InsertReliefDistribution): Promise<ReliefDistribution> {
    const [newDistribution] = await db.insert(reliefDistribution).values(distribution).returning();
    
    // Update resource quantities
    await db
      .update(resources)
      .set({
        distributedQuantity: sql`${resources.distributedQuantity} + ${distribution.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, distribution.resourceId));

    return newDistribution;
  }

  // Weather alerts operations
  async getActiveWeatherAlerts(): Promise<WeatherAlert[]> {
    return await db
      .select()
      .from(weatherAlerts)
      .where(
        and(
          eq(weatherAlerts.isActive, true),
          gte(weatherAlerts.validUntil, new Date())
        )
      )
      .orderBy(desc(weatherAlerts.createdAt));
  }

  async createWeatherAlert(alert: InsertWeatherAlert): Promise<WeatherAlert> {
    const [newAlert] = await db.insert(weatherAlerts).values(alert).returning();
    return newAlert;
  }

  async deactivateWeatherAlert(id: string): Promise<void> {
    await db
      .update(weatherAlerts)
      .set({ isActive: false })
      .where(eq(weatherAlerts.id, id));
  }

  // Response teams operations
  async getResponseTeams(): Promise<ResponseTeam[]> {
    return await db.select().from(responseTeams).orderBy(desc(responseTeams.updatedAt));
  }

  async createResponseTeam(team: InsertResponseTeam): Promise<ResponseTeam> {
    const [newTeam] = await db.insert(responseTeams).values(team).returning();
    return newTeam;
  }

  async updateResponseTeam(
    id: string,
    updates: Partial<InsertResponseTeam>
  ): Promise<ResponseTeam | undefined> {
    const [updated] = await db
      .update(responseTeams)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(responseTeams.id, id))
      .returning();
    return updated;
  }

  // Activity log operations
  async getRecentActivities(limit = 20): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLog)
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }

  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLog).values(activity).returning();
    return newActivity;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    activeZones: number;
    affectedPeople: number;
    reliefDistributed: number;
    responseTeams: number;
  }> {
    const [activeZonesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(floodZones)
      .where(eq(floodZones.isActive, true));

    const [affectedPeopleCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(affectedPopulation);

    const [reliefPercentage] = await db
      .select({
        percentage: sql<number>`
          CASE 
            WHEN SUM(${resources.totalQuantity}) = 0 THEN 0
            ELSE ROUND((SUM(${resources.distributedQuantity}) * 100.0 / SUM(${resources.totalQuantity})), 0)
          END
        `
      })
      .from(resources);

    const [responseTeamsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(responseTeams);

    return {
      activeZones: activeZonesCount.count,
      affectedPeople: affectedPeopleCount.count,
      reliefDistributed: reliefPercentage.percentage,
      responseTeams: responseTeamsCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
