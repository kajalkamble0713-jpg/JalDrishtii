/**
 * JalDrishti PostgreSQL + PostGIS Connection & Pool Manager
 * Provides connection pooling, migration automation, and graceful fallback
 * when PostgreSQL is offline or unreachable.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DatabaseStatus {
  isConnected: boolean;
  poolSize: number;
  databaseName?: string;
  host?: string;
  errorMessage?: string;
  postgisInstalled: boolean;
  migrationsRun: string[];
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: pg.Pool | null = null;
  private isConnected = false;
  private postgisInstalled = false;
  private migrationsRun: string[] = [];
  private lastError: string | null = null;

  private constructor() {
    this.initPool();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initPool(): void {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString || connectionString.trim().length === 0) {
      this.lastError = 'DATABASE_URL environment variable is not defined.';
      console.info('[DatabaseManager] Running in In-Memory/Static Mode (No DATABASE_URL provided).');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 8000,
      });

      this.pool.on('error', (err) => {
        console.warn('[DatabaseManager] Unexpected idle client error:', err.message);
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.lastError = msg;
      console.warn('[DatabaseManager] Failed to create database connection pool:', msg);
    }
  }

  /**
   * Test database connectivity and verify PostGIS extension.
   */
  public async testConnection(): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const client = await this.pool.connect();
      try {
        const res = await client.query('SELECT current_database() as db, NOW() as now;');
        this.isConnected = true;
        this.lastError = null;

        // Verify PostGIS extension
        try {
          const postgisRes = await client.query('SELECT PostGIS_Version() as version;');
          this.postgisInstalled = Boolean(postgisRes.rows[0]?.version);
        } catch {
          this.postgisInstalled = false;
        }

        console.info(`[DatabaseManager] Connected to PostgreSQL (${res.rows[0]?.db}), PostGIS: ${this.postgisInstalled}`);
        return true;
      } finally {
        client.release();
      }
    } catch (err: unknown) {
      this.isConnected = false;
      this.lastError = err instanceof Error ? err.message : String(err);
      console.warn('[DatabaseManager] Database ping failed. Operating with in-memory repository fallback:', this.lastError);
      return false;
    }
  }

  /**
   * Run SQL migrations if PostgreSQL connection is live.
   */
  public async runMigrations(): Promise<string[]> {
    if (!this.pool || !this.isConnected) return [];

    const migrationFiles = [
      '001_production_postgis_schema.sql',
      '002_government_operations_schema.sql',
      '003_field_operations_lab_feedback_schema.sql',
    ];
    const executed: string[] = [];

    const client = await this.pool.connect();
    try {
      for (const file of migrationFiles) {
        const filePath = path.join(__dirname, 'migrations', file);
        if (fs.existsSync(filePath)) {
          const sql = fs.readFileSync(filePath, 'utf-8');
          await client.query(sql);
          executed.push(file);
          console.info(`[DatabaseManager] Successfully executed migration: ${file}`);
        }
      }
      this.migrationsRun = executed;
      return executed;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[DatabaseManager] Migration execution error:', msg);
      return executed;
    } finally {
      client.release();
    }
  }

  /**
   * Execute parameterized SQL query safely.
   */
  public async query<R extends pg.QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<pg.QueryResult<R> | null> {
    if (!this.pool || !this.isConnected) return null;

    try {
      return await this.pool.query<R>(text, params);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[DatabaseManager] Query error: ${msg} | SQL: ${text.substring(0, 80)}...`);
      return null;
    }
  }

  public getStatus(): DatabaseStatus {
    return {
      isConnected: this.isConnected,
      poolSize: this.pool?.totalCount || 0,
      errorMessage: this.lastError || undefined,
      postgisInstalled: this.postgisInstalled,
      migrationsRun: this.migrationsRun,
    };
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
    }
  }
}
