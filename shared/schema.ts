import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("field_worker"), // district_officer, ngo, field_worker
  district: varchar("district"),
  organization: varchar("organization"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flood zones table
export const floodZones = pgTable("flood_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  district: varchar("district").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  riskLevel: varchar("risk_level").notNull(), // high, medium, low
  radius: integer("radius").notNull(), // in meters
  waterLevel: decimal("water_level", { precision: 8, scale: 2 }),
  dangerMark: decimal("danger_mark", { precision: 8, scale: 2 }),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Affected population registry
export const affectedPopulation = pgTable("affected_population", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  age: integer("age"),
  gender: varchar("gender"),
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  floodZoneId: varchar("flood_zone_id").references(() => floodZones.id),
  evacuationStatus: varchar("evacuation_status").notNull(), // evacuated, sheltered, at_risk, safe
  medicalNeeds: text("medical_needs"),
  familyMembers: integer("family_members").default(1),
  registeredBy: varchar("registered_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Resource types and inventory
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // food, medical, shelter, water, clothing
  unit: varchar("unit").notNull(), // packets, pieces, liters, etc.
  totalQuantity: integer("total_quantity").notNull(),
  allocatedQuantity: integer("allocated_quantity").default(0),
  distributedQuantity: integer("distributed_quantity").default(0),
  priority: varchar("priority").notNull(), // high, medium, low
  location: varchar("location"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relief distribution tracking
export const reliefDistribution = pgTable("relief_distribution", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resourceId: varchar("resource_id").references(() => resources.id).notNull(),
  floodZoneId: varchar("flood_zone_id").references(() => floodZones.id),
  quantity: integer("quantity").notNull(),
  distributedTo: varchar("distributed_to"), // shelter name, area, etc.
  distributedBy: varchar("distributed_by").references(() => users.id),
  distributionDate: timestamp("distribution_date").defaultNow(),
  recipientCount: integer("recipient_count"),
  notes: text("notes"),
  status: varchar("status").default("completed"), // planned, in_progress, completed
  createdAt: timestamp("created_at").defaultNow(),
});

// Weather data and alerts
export const weatherAlerts = pgTable("weather_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // flood_warning, heavy_rain, dam_release
  severity: varchar("severity").notNull(), // high, medium, low
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  affectedArea: varchar("affected_area"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Response teams
export const responseTeams = pgTable("response_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // relief_distribution, medical_response, evacuation, standby
  status: varchar("status").notNull(), // active, standby, unavailable
  currentLocation: varchar("current_location"),
  assignedZone: varchar("assigned_zone").references(() => floodZones.id),
  memberCount: integer("member_count").default(0),
  contactNumber: varchar("contact_number"),
  leadOfficer: varchar("lead_officer").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log for tracking all operations
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // distribution, evacuation, alert, registration
  description: text("description").notNull(),
  entityType: varchar("entity_type"), // resource, population, team, zone
  entityId: varchar("entity_id"),
  performedBy: varchar("performed_by").references(() => users.id),
  location: varchar("location"),
  metadata: jsonb("metadata"), // additional contextual data
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  affectedPopulation: many(affectedPopulation),
  reliefDistribution: many(reliefDistribution),
  weatherAlerts: many(weatherAlerts),
  responseTeams: many(responseTeams),
  activityLog: many(activityLog),
}));

export const floodZonesRelations = relations(floodZones, ({ many }) => ({
  affectedPopulation: many(affectedPopulation),
  reliefDistribution: many(reliefDistribution),
  responseTeams: many(responseTeams),
}));

export const resourcesRelations = relations(resources, ({ many }) => ({
  reliefDistribution: many(reliefDistribution),
}));

export const affectedPopulationRelations = relations(affectedPopulation, ({ one }) => ({
  floodZone: one(floodZones, {
    fields: [affectedPopulation.floodZoneId],
    references: [floodZones.id],
  }),
  registeredBy: one(users, {
    fields: [affectedPopulation.registeredBy],
    references: [users.id],
  }),
}));

export const reliefDistributionRelations = relations(reliefDistribution, ({ one }) => ({
  resource: one(resources, {
    fields: [reliefDistribution.resourceId],
    references: [resources.id],
  }),
  floodZone: one(floodZones, {
    fields: [reliefDistribution.floodZoneId],
    references: [floodZones.id],
  }),
  distributedBy: one(users, {
    fields: [reliefDistribution.distributedBy],
    references: [users.id],
  }),
}));

export const weatherAlertsRelations = relations(weatherAlerts, ({ one }) => ({
  createdBy: one(users, {
    fields: [weatherAlerts.createdBy],
    references: [users.id],
  }),
}));

export const responseTeamsRelations = relations(responseTeams, ({ one }) => ({
  assignedZone: one(floodZones, {
    fields: [responseTeams.assignedZone],
    references: [floodZones.id],
  }),
  leadOfficer: one(users, {
    fields: [responseTeams.leadOfficer],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  performedBy: one(users, {
    fields: [activityLog.performedBy],
    references: [users.id],
  }),
}));

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertFloodZone = z.infer<typeof insertFloodZoneSchema>;
export type FloodZone = typeof floodZones.$inferSelect;

export type InsertAffectedPopulation = z.infer<typeof insertAffectedPopulationSchema>;
export type AffectedPopulation = typeof affectedPopulation.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertReliefDistribution = z.infer<typeof insertReliefDistributionSchema>;
export type ReliefDistribution = typeof reliefDistribution.$inferSelect;

export type InsertWeatherAlert = z.infer<typeof insertWeatherAlertSchema>;
export type WeatherAlert = typeof weatherAlerts.$inferSelect;

export type InsertResponseTeam = z.infer<typeof insertResponseTeamSchema>;
export type ResponseTeam = typeof responseTeams.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;

// Create insert schemas
export const insertFloodZoneSchema = createInsertSchema(floodZones).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertAffectedPopulationSchema = createInsertSchema(affectedPopulation).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReliefDistributionSchema = createInsertSchema(reliefDistribution).omit({
  id: true,
  distributionDate: true,
  createdAt: true,
});

export const insertWeatherAlertSchema = createInsertSchema(weatherAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertResponseTeamSchema = createInsertSchema(responseTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});
