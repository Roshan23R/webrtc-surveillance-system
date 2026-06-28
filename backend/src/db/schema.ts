import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  username: varchar("username", { length: 100 }).unique().notNull(),

  password: text("password").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const cameras = pgTable(
  "cameras",

  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),

    name: varchar(
      "name",

      { length: 255 },
    ).notNull(),

    rtspUrl: text("rtsp_url").notNull(),

    location: varchar(
      "location",

      { length: 255 },
    ),

    enabled: boolean("enabled").default(true),

    status: varchar(
      "status",

      { length: 50 },
    ).default("stopped"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
)

export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),

  cameraId: uuid("camera_id")
    .references(() => cameras.id)
    .notNull(),

  eventType: varchar("event_type", { length: 50 }).notNull(),

  confidence: varchar("confidence", { length: 20 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})
