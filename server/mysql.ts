import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import { Batch, Order, User, Buyer, Demand } from './db.js';
import { WhatsAppConversationState, WhatsAppWebhookLog } from './whatsapp/types.js';

export interface MySQLConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean | object;
  connectionUrl?: string;
}

export interface MySQLStatus {
  configured: boolean;
  connected: boolean;
  host: string | null;
  port: number | null;
  database: string | null;
  user: string | null;
  ssl: boolean;
  latencyMs: number | null;
  errorMessage: string | null;
  tables: Record<string, number>;
  lastChecked: string;
}

let pool: Pool | null = null;
let isConnected = false;
let lastError: string | null = null;
let lastLatency: number | null = null;

// Complete DDL Schema for MySQL
export const MYSQL_SCHEMA_SQL = `
-- =======================================================
-- FreshRoute.2 MySQL Relational Schema
-- Supports Post-Harvest Batches, Orders, Users & WhatsApp
-- =======================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  password VARCHAR(255),
  location VARCHAR(255),
  farm_or_business_name VARCHAR(255),
  primary_crop_or_demand VARCHAR(255),
  avatar_url TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS produce_batches (
  id VARCHAR(64) PRIMARY KEY,
  farmer_id VARCHAR(64) NOT NULL,
  farmer_name VARCHAR(255) NOT NULL,
  farm_location VARCHAR(255) NOT NULL,
  crop VARCHAR(100) NOT NULL,
  variety VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  harvest_date VARCHAR(30) NOT NULL,
  harvest_time VARCHAR(30) NOT NULL,
  base_price_per_kg DECIMAL(10,2) NOT NULL,
  current_quality_score DECIMAL(5,2) NOT NULL,
  freshness_percent DECIMAL(5,2) NOT NULL,
  ripeness_percent DECIMAL(5,2) NOT NULL,
  damage_percent DECIMAL(5,2) NOT NULL,
  estimated_shelf_life_hours DECIMAL(10,2) NOT NULL,
  spoilage_risk_percent DECIMAL(5,2) NOT NULL,
  detected_issues JSON,
  image_url TEXT,
  status VARCHAR(30) DEFAULT 'available',
  storage_type VARCHAR(30) DEFAULT 'ambient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_batches_farmer (farmer_id),
  INDEX idx_batches_crop (crop),
  INDEX idx_batches_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS buyers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  distance_km DECIMAL(8,2) NOT NULL,
  demanded_crops JSON,
  offered_price_per_kg DECIMAL(10,2) NOT NULL,
  min_quality_score DECIMAL(5,2) NOT NULL,
  payment_terms VARCHAR(100) NOT NULL,
  reliability_rating DECIMAL(3,2) NOT NULL,
  ai_match_score DECIMAL(5,2) NOT NULL,
  verified_badge BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  batch_id VARCHAR(64) NOT NULL,
  crop VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  quality_score DECIMAL(5,2) NOT NULL,
  farmer_id VARCHAR(64) NOT NULL,
  farmer_name VARCHAR(255) NOT NULL,
  farm_location VARCHAR(255) NOT NULL,
  buyer_id VARCHAR(64) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_location VARCHAR(255) NOT NULL,
  distance_km DECIMAL(8,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(12,2) NOT NULL,
  transport_cost DECIMAL(10,2) NOT NULL,
  net_farmer_earnings DECIMAL(12,2) NOT NULL,
  selected_vehicle VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  estimated_transit_time VARCHAR(50) NOT NULL,
  temperature_reading_c DECIMAL(5,2) DEFAULT 0,
  humidity_percent DECIMAL(5,2) DEFAULT 0,
  pickup_time VARCHAR(30),
  delivery_time VARCHAR(30),
  timeline JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_farmer (farmer_id),
  INDEX idx_orders_buyer (buyer_id),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS demands (
  id VARCHAR(64) PRIMARY KEY,
  buyer_id VARCHAR(64) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  crop VARCHAR(100) NOT NULL,
  required_quantity_kg DECIMAL(10,2) NOT NULL,
  offered_price_per_kg DECIMAL(10,2) NOT NULL,
  min_quality_score DECIMAL(5,2) NOT NULL,
  delivery_location VARCHAR(255) NOT NULL,
  needed_by_date VARCHAR(30) NOT NULL,
  status VARCHAR(30) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_demands_crop (crop)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  phone VARCHAR(30) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  conversation_step VARCHAR(50) DEFAULT 'IDLE',
  crop VARCHAR(100),
  quantity_kg DECIMAL(10,2),
  harvest_time VARCHAR(100),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  location_name VARCHAR(255),
  location_address TEXT,
  last_order_id VARCHAR(64),
  pending_batch_id VARCHAR(64),
  session_metadata JSON,
  last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_webhook_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  phone VARCHAR(30) NOT NULL,
  type VARCHAR(30) NOT NULL,
  intent VARCHAR(100) NOT NULL,
  incoming_snippet TEXT,
  response_snippet TEXT,
  status VARCHAR(20) NOT NULL,
  payload JSON,
  response_payload JSON,
  INDEX idx_wa_logs_phone (phone),
  INDEX idx_wa_logs_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

/**
 * Get configuration from environment variables
 */
export function getMySQLConfig(): MySQLConfig {
  const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
  const host = process.env.MYSQL_HOST;
  const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'freshroute_db';
  const sslParam = process.env.MYSQL_SSL;
  const ssl = sslParam === 'true' ? { rejectUnauthorized: false } : false;

  return {
    connectionUrl,
    host,
    port,
    user,
    password,
    database,
    ssl,
  };
}

/**
 * Initialize MySQL connection pool and ensure tables exist
 */
export async function initMySQL(): Promise<boolean> {
  const config = getMySQLConfig();

  // If no host or url provided, don't attempt to connect
  if (!config.host && !config.connectionUrl) {
    isConnected = false;
    lastError = 'MYSQL_HOST or MYSQL_URL is not set. Using local database store.';
    return false;
  }

  try {
    let poolOptions: PoolOptions;

    if (config.connectionUrl) {
      poolOptions = {
        uri: config.connectionUrl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      };
    } else {
      poolOptions = {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl as any,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      };
    }

    pool = mysql.createPool(poolOptions);

    // Test ping and calculate latency
    const start = Date.now();
    const conn = await pool.getConnection();
    lastLatency = Date.now() - start;
    conn.release();

    isConnected = true;
    lastError = null;
    console.log(`✅ MySQL Connected successfully to ${config.host || 'database'} (Latency: ${lastLatency}ms)`);

    // Ensure database tables exist
    await createTables();

    return true;
  } catch (err: any) {
    isConnected = false;
    lastError = err.message || 'Unknown MySQL connection error';
    console.warn(`⚠️ MySQL Connection Warning: ${lastError}. Falling back to local store.`);
    return false;
  }
}

/**
 * Execute DDL statement batch to set up all tables
 */
async function createTables(): Promise<void> {
  if (!pool || !isConnected) return;

  try {
    // Execute individual table create queries
    const statements = MYSQL_SCHEMA_SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      await pool.query(statement);
    }
    console.log('✅ FreshRoute MySQL schema initialized (all tables verified)');
  } catch (err: any) {
    console.error('Failed to create MySQL tables:', err.message);
  }
}

/**
 * Get current health and status of MySQL integration
 */
export async function getMySQLStatus(): Promise<MySQLStatus> {
  const config = getMySQLConfig();
  const configured = Boolean(config.host || config.connectionUrl);
  const tables: Record<string, number> = {};

  if (pool && isConnected) {
    try {
      const start = Date.now();
      const conn = await pool.getConnection();
      lastLatency = Date.now() - start;
      conn.release();

      // Query table counts
      const tableNames = [
        'users',
        'produce_batches',
        'buyers',
        'orders',
        'demands',
        'whatsapp_conversations',
        'whatsapp_webhook_logs',
      ];

      for (const t of tableNames) {
        try {
          const [rows]: any = await pool.query(`SELECT COUNT(*) as count FROM ${t}`);
          tables[t] = rows[0]?.count || 0;
        } catch {
          tables[t] = 0;
        }
      }
    } catch (err: any) {
      isConnected = false;
      lastError = err.message;
    }
  }

  return {
    configured,
    connected: isConnected,
    host: config.host || (config.connectionUrl ? 'Via Connection URI' : null),
    port: config.port || 3306,
    database: config.database || null,
    user: config.user || null,
    ssl: Boolean(config.ssl),
    latencyMs: isConnected ? lastLatency : null,
    errorMessage: lastError,
    tables,
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Write / Sync Batch into MySQL
 */
export async function saveBatchToMySQL(batch: Batch): Promise<boolean> {
  if (!pool || !isConnected) return false;
  try {
    const query = `
      INSERT INTO produce_batches (
        id, farmer_id, farmer_name, farm_location, crop, variety,
        quantity_kg, harvest_date, harvest_time, base_price_per_kg,
        current_quality_score, freshness_percent, ripeness_percent,
        damage_percent, estimated_shelf_life_hours, spoilage_risk_percent,
        detected_issues, image_url, status, storage_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        quantity_kg = VALUES(quantity_kg),
        current_quality_score = VALUES(current_quality_score),
        freshness_percent = VALUES(freshness_percent),
        ripeness_percent = VALUES(ripeness_percent),
        damage_percent = VALUES(damage_percent),
        estimated_shelf_life_hours = VALUES(estimated_shelf_life_hours),
        spoilage_risk_percent = VALUES(spoilage_risk_percent),
        detected_issues = VALUES(detected_issues),
        status = VALUES(status),
        storage_type = VALUES(storage_type);
    `;

    const values = [
      batch.id,
      batch.farmerId,
      batch.farmerName,
      batch.farmLocation,
      batch.crop,
      batch.variety,
      batch.quantityKg,
      batch.harvestDate,
      batch.harvestTime,
      batch.basePricePerKg,
      batch.currentQualityScore,
      batch.freshnessPercent,
      batch.ripenessPercent,
      batch.damagePercent,
      batch.estimatedShelfLifeHours,
      batch.spoilageRiskPercent,
      JSON.stringify(batch.detectedIssues || []),
      batch.imageUrl,
      batch.status,
      batch.storageType,
      batch.createdAt || new Date().toISOString(),
    ];

    await pool.query(query, values);
    return true;
  } catch (err: any) {
    console.error(`Failed to save batch ${batch.id} to MySQL:`, err.message);
    return false;
  }
}

/**
 * Write / Sync Order into MySQL
 */
export async function saveOrderToMySQL(order: Order): Promise<boolean> {
  if (!pool || !isConnected) return false;
  try {
    const query = `
      INSERT INTO orders (
        id, batch_id, crop, quantity_kg, quality_score,
        farmer_id, farmer_name, farm_location,
        buyer_id, buyer_name, buyer_location,
        distance_km, price_per_kg, total_value, transport_cost, net_farmer_earnings,
        selected_vehicle, status, estimated_transit_time,
        temperature_reading_c, humidity_percent, pickup_time, delivery_time,
        timeline, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        temperature_reading_c = VALUES(temperature_reading_c),
        humidity_percent = VALUES(humidity_percent),
        delivery_time = VALUES(delivery_time),
        timeline = VALUES(timeline);
    `;

    const values = [
      order.id,
      order.batchId,
      order.crop,
      order.quantityKg,
      order.qualityScore,
      order.farmerId,
      order.farmerName,
      order.farmLocation,
      order.buyerId,
      order.buyerName,
      order.buyerLocation,
      order.distanceKm,
      order.pricePerKg,
      order.totalValue,
      order.transportCost,
      order.netFarmerEarnings,
      order.selectedVehicle,
      order.status,
      order.estimatedTransitTime,
      order.temperatureReadingC || 0,
      order.humidityPercent || 0,
      order.pickupTime || null,
      order.deliveryTime || null,
      JSON.stringify(order.timeline || []),
      order.createdAt || new Date().toISOString(),
    ];

    await pool.query(query, values);
    return true;
  } catch (err: any) {
    console.error(`Failed to save order ${order.id} to MySQL:`, err.message);
    return false;
  }
}

/**
 * Write / Sync WhatsApp Conversation State into MySQL
 */
export async function saveWhatsAppConversationToMySQL(phone: string, state: WhatsAppConversationState): Promise<boolean> {
  if (!pool || !isConnected) return false;
  try {
    const query = `
      INSERT INTO whatsapp_conversations (
        phone, user_id, language, conversation_step, crop, quantity_kg,
        harvest_time, latitude, longitude, location_name, location_address,
        last_order_id, pending_batch_id, session_metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        language = VALUES(language),
        conversation_step = VALUES(conversation_step),
        crop = VALUES(crop),
        quantity_kg = VALUES(quantity_kg),
        harvest_time = VALUES(harvest_time),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        location_name = VALUES(location_name),
        location_address = VALUES(location_address),
        last_order_id = VALUES(last_order_id),
        pending_batch_id = VALUES(pending_batch_id),
        session_metadata = VALUES(session_metadata);
    `;

    const values = [
      phone,
      state.userId,
      state.language,
      state.conversationStep,
      state.crop || null,
      state.quantityKg || null,
      state.harvestTime || null,
      state.location?.latitude || null,
      state.location?.longitude || null,
      state.location?.name || null,
      state.location?.address || null,
      state.lastOrderId || null,
      state.lastBatchId || null,
      JSON.stringify(state),
    ];

    await pool.query(query, values);
    return true;
  } catch (err: any) {
    console.error(`Failed to save WhatsApp session ${phone} to MySQL:`, err.message);
    return false;
  }
}

/**
 * Write WhatsApp Webhook Log into MySQL
 */
export async function saveWhatsAppLogToMySQL(log: WhatsAppWebhookLog): Promise<boolean> {
  if (!pool || !isConnected) return false;
  try {
    const query = `
      INSERT INTO whatsapp_webhook_logs (
        id, timestamp, phone, type, intent, incoming_snippet,
        response_snippet, status, payload, response_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      log.id,
      new Date(log.timestamp),
      log.phone,
      log.type,
      log.intent,
      log.incomingSnippet,
      log.responseSnippet,
      log.status,
      JSON.stringify(log.payload || {}),
      JSON.stringify(log.responsePayload || {}),
    ];

    await pool.query(query, values);
    return true;
  } catch (err: any) {
    console.error(`Failed to save WhatsApp log ${log.id} to MySQL:`, err.message);
    return false;
  }
}

/**
 * Sync entire in-memory / JSON database into MySQL (for initialization & manual migration)
 */
export async function syncAllToMySQL(
  batches: Batch[],
  orders: Order[],
  users: User[],
  buyers: Buyer[],
  demands: Demand[]
): Promise<{ success: boolean; synced: Record<string, number>; error?: string }> {
  if (!pool || !isConnected) {
    return { success: false, synced: {}, error: 'MySQL is not connected' };
  }

  const synced = {
    users: 0,
    batches: 0,
    buyers: 0,
    orders: 0,
    demands: 0,
  };

  try {
    // 1. Sync Users
    for (const u of users) {
      await pool.query(
        `INSERT INTO users (id, role, name, email, phone, password, location, farm_or_business_name, primary_crop_or_demand, avatar_url, verified, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), location=VALUES(location);`,
        [u.id, u.role, u.name, u.email, u.phone, u.password || null, u.location, u.farmOrBusinessName, u.primaryCropOrDemand, u.avatarUrl, u.verified ? 1 : 0, u.createdAt]
      );
      synced.users++;
    }

    // 2. Sync Buyers
    for (const b of buyers) {
      await pool.query(
        `INSERT INTO buyers (id, name, company_name, business_type, location, distance_km, demanded_crops, offered_price_per_kg, min_quality_score, payment_terms, reliability_rating, ai_match_score, verified_badge, avatar_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE offered_price_per_kg=VALUES(offered_price_per_kg), ai_match_score=VALUES(ai_match_score);`,
        [b.id, b.name, b.companyName, b.businessType, b.location, b.distanceKm, JSON.stringify(b.demandedCrops), b.offeredPricePerKg, b.minQualityScore, b.paymentTerms, b.reliabilityRating, b.aiMatchScore, b.verifiedBadge ? 1 : 0, b.avatarUrl]
      );
      synced.buyers++;
    }

    // 3. Sync Batches
    for (const b of batches) {
      await saveBatchToMySQL(b);
      synced.batches++;
    }

    // 4. Sync Orders
    for (const o of orders) {
      await saveOrderToMySQL(o);
      synced.orders++;
    }

    // 5. Sync Demands
    for (const d of demands) {
      await pool.query(
        `INSERT INTO demands (id, buyer_id, buyer_name, company_name, crop, required_quantity_kg, offered_price_per_kg, min_quality_score, delivery_location, needed_by_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE required_quantity_kg=VALUES(required_quantity_kg), offered_price_per_kg=VALUES(offered_price_per_kg);`,
        [d.id, d.buyerId, d.buyerName, d.companyName, d.crop, d.requiredQuantityKg, d.offeredPricePerKg, d.minQualityScore, d.deliveryLocation, d.neededByDate, d.status]
      );
      synced.demands++;
    }

    return { success: true, synced };
  } catch (err: any) {
    return { success: false, synced, error: err.message };
  }
}
