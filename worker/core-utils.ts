/**
 * Core utilities for Multiple Entities sharing a single SQLite database (Refactored from Durable Objects)
 * Compatible with Node.js runtime.
 */
import type { ApiResponse } from "@shared/types";
import type { Context } from "hono";
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.resolve(DATA_DIR, 'db.sqlite');

// Initialize Database
const db = new Database(DB_PATH);
// Create key-value table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT,
    version INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS indexes (
    index_name TEXT,
    item_key TEXT,
    PRIMARY KEY (index_name, item_key)
  );
`);

export interface Env {
  // In Node.js, we don't need a binding for the DO. 
  // We can access the singleton DB directly or via a service.
  // For compatibility with existing code, we might keep this minimal or unused.
  KLASSIFIER_API_KEY?: string;
  KLASSIFIER_API_URL?: string;
}

type Doc<T> = { v: number; data: T };

/**
 * SQLite-backed storage adapter mimicking Durable Object behavior
 */
export class GlobalStorage {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async alarm(_env: Env) {
    // In a real Node app, use setInterval or node-cron. 
    // For now, we manually trigger or ignore if it's just stats simulation.
    const { DialerSimulationService } = await import("./entities");
    // We can pass a mock env or empty object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await DialerSimulationService.tick({} as any);
  }

  static async del(key: string): Promise<boolean> {
    const res = db.prepare('DELETE FROM kv_store WHERE key = ?').run(key);
    return res.changes > 0;
  }

  static async has(key: string): Promise<boolean> {
    const row = db.prepare('SELECT 1 FROM kv_store WHERE key = ?').get(key);
    return !!row;
  }

  static async getDoc<T>(key: string): Promise<Doc<T> | null> {
    const row = db.prepare('SELECT value, version FROM kv_store WHERE key = ?').get(key) as { value: string, version: number } | undefined;
    if (!row) return null;
    return { v: row.version, data: JSON.parse(row.value) };
  }

  static async casPut<T>(key: string, expectedV: number, data: T): Promise<{ ok: boolean; v: number }> {
    // SQLite transaction for CAS
    const transact = db.transaction(() => {
      const row = db.prepare('SELECT version FROM kv_store WHERE key = ?').get(key) as { version: number } | undefined;
      const curV = row?.version ?? 0;

      if (curV !== expectedV) {
        return { ok: false, v: curV };
      }

      const nextV = curV + 1;
      const json = JSON.stringify(data);

      if (row) {
        db.prepare('UPDATE kv_store SET value = ?, version = ? WHERE key = ?').run(json, nextV, key);
      } else {
        db.prepare('INSERT INTO kv_store (key, value, version) VALUES (?, ?, ?)').run(key, json, nextV);
      }
      return { ok: true, v: nextV };
    });

    return transact();
  }

  // List keys with prefix
  static async listPrefix(prefix: string, startAfter?: string | null, limit?: number) {
    let query = 'SELECT key FROM kv_store WHERE key LIKE ?';
    const params: (string | number)[] = [`${prefix}%`];

    if (startAfter) {
      query += ' AND key > ?';
      params.push(startAfter);
    }

    query += ' ORDER BY key ASC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const rows = db.prepare(query).all(...params) as { key: string }[];
    const keys = rows.map(r => r.key);
    const next = (limit && keys.length === limit) ? keys[keys.length - 1] : null;

    return { keys, next };
  }

  // Index simulation
  static async indexAddBatch(indexName: string, items: string[]): Promise<void> {
    if (items.length === 0) return;
    const insert = db.prepare('INSERT OR IGNORE INTO indexes (index_name, item_key) VALUES (?, ?)');
    const txt = db.transaction((name, keys) => {
      for (const k of keys) insert.run(name, k);
    });
    txt(indexName, items);
  }

  static async indexRemoveBatch(indexName: string, items: string[]): Promise<number> {
    if (items.length === 0) return 0;
    const remove = db.prepare('DELETE FROM indexes WHERE index_name = ? AND item_key = ?');
    const txt = db.transaction((name, keys) => {
      let count = 0;
      for (const k of keys) {
        const res = remove.run(name, k);
        count += res.changes;
      }
      return count;
    });
    return txt(indexName, items);
  }

  static async indexDrop(indexName: string): Promise<void> {
    db.prepare('DELETE FROM indexes WHERE index_name = ?').run(indexName);
  }

  static async indexList(indexName: string, cursor?: string | null, limit?: number): Promise<{ items: string[], next: string | null }> {
    let query = 'SELECT item_key FROM indexes WHERE index_name = ?';
    const params: (string | number)[] = [indexName];

    if (cursor) {
      query += ' AND item_key > ?';
      params.push(cursor);
    }

    query += ' ORDER BY item_key ASC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const rows = db.prepare(query).all(...params) as { item_key: string }[];
    const items = rows.map(r => r.item_key);
    const next = (limit && items.length === limit) ? items[items.length - 1] : null;
    return { items, next };
  }
}


export interface EntityStatics<S, T extends Entity<S>> {
  new(env: Env, id: string): T; // inherited default ctor
  readonly entityName: string;
  readonly initialState: S;
}

/**
 * Base class for entities - extend this class to create new entities
 */
export abstract class Entity<State> {
  protected _state!: State;
  protected _version: number = 0;
  protected readonly _id: string;
  protected readonly entityName: string;
  protected readonly env: Env;

  constructor(env: Env, id: string) {
    this.env = env;
    this._id = id;
    // Read subclass statics via new.target / constructor
    const Ctor = this.constructor as EntityStatics<State, this>;
    this.entityName = Ctor.entityName;
  }

  /** Synchronous accessors */
  get id(): string {
    return this._id;
  }

  get state(): State {
    return this._state;
  }

  /** Storage key for this entity document. */
  protected key(): string {
    return `${this.entityName}:${this._id}`;
  }

  /** Save and refresh cache. */
  async save(next: State): Promise<void> {
    for (let i = 0; i < 4; i++) {
      // Optimization: In local SQLite, contention is low/non-existent due to sync driver or WAL,
      // but keeping CAS logic for correctness if we switch back or have concurrent requests.
      await this.ensureState();
      const res = await GlobalStorage.casPut(this.key(), this._version, next);
      if (res.ok) {
        this._version = res.v;
        this._state = next;
        return;
      }
      // retry on contention
    }
    throw new Error("Concurrent modification detected");
  }

  protected async ensureState(): Promise<State> {
    const Ctor = this.constructor as EntityStatics<State, this>;
    const doc = await GlobalStorage.getDoc<State>(this.key());
    if (doc == null) {
      this._version = 0;
      this._state = Ctor.initialState;
      return this._state;
    }
    this._version = doc.v;
    this._state = doc.data;
    return this._state;
  }

  async mutate(updater: (current: State) => State): Promise<State> {
    // Small bounded retry loop for CAS contention
    for (let i = 0; i < 4; i++) {
      const current = await this.ensureState();
      const startV = this._version;
      const next = updater(current);
      const res = await GlobalStorage.casPut(this.key(), startV, next);
      if (res.ok) {
        this._version = res.v;
        this._state = next;
        return next;
      }
      // someone else updated; retry
    }
    throw new Error("Concurrent modification detected");
  }

  async getState(): Promise<State> {
    return this.ensureState();
  }

  async patch(p: Partial<State>): Promise<void> {
    await this.mutate((s) => ({ ...s, ...p }));
  }

  async exists(): Promise<boolean> {
    return GlobalStorage.has(this.key());
  }

  /** Delete the entity. */
  async delete(): Promise<boolean> {
    const ok = await GlobalStorage.del(this.key());
    if (ok) {
      const Ctor = this.constructor as EntityStatics<State, this>;
      this._version = 0;
      this._state = Ctor.initialState;
    }
    return ok;
  }
}

// Minimal prefix-based index 
export class Index<T extends string> extends Entity<unknown> {
  static readonly entityName = "sys-index-root";
  // The original used a DO for the index. We will use the SQLite table `indexes` instead.
  // We don't really need the Entity base class overhead for this in the new design, 
  // but keeping signature for compatibility.

  private indexName: string;

  constructor(env: Env, name: string) {
    super(env, `index:${name}`);
    this.indexName = name;
  }

  async addBatch(itemsToAdd: T[]): Promise<void> {
    if (itemsToAdd.length === 0) return;
    await GlobalStorage.indexAddBatch(this.indexName, itemsToAdd);
  }

  async add(item: T): Promise<void> {
    return this.addBatch([item]);
  }

  async remove(item: T): Promise<boolean> {
    const removed = await this.removeBatch([item]);
    return removed > 0;
  }

  async removeBatch(itemsToRemove: T[]): Promise<number> {
    return GlobalStorage.indexRemoveBatch(this.indexName, itemsToRemove);
  }

  async clear(): Promise<void> {
    await GlobalStorage.indexDrop(this.indexName);
  }

  async page(cursor?: string | null, limit?: number): Promise<{ items: T[]; next: string | null }> {
    const { items, next } = await GlobalStorage.indexList(this.indexName, cursor, limit);
    return { items: items as T[], next };
  }

  async list(): Promise<T[]> {
    const { items } = await GlobalStorage.indexList(this.indexName);
    return items as T[];
  }
}

type IS<T> = T extends new (env: Env, id: string) => IndexedEntity<infer S> ? S : never;
type HS<TCtor> = TCtor & { indexName: string; keyOf(state: IS<TCtor>): string; seedData?: ReadonlyArray<IS<TCtor>> };
type CtorAny = new (env: Env, id: string) => IndexedEntity<{ id: string }>;

export abstract class IndexedEntity<S extends { id: string }> extends Entity<S> {
  static readonly indexName: string;
  static keyOf<U extends { id: string }>(state: U): string { return state.id; }

  // Static helpers infer S from `this` and the arguments
  static async create<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, state: IS<TCtor>): Promise<IS<TCtor>> {
    const id = this.keyOf(state);
    const inst = new this(env, id);
    await inst.save(state);
    const idx = new Index<string>(env, this.indexName);
    await idx.add(id);
    return state;
  }

  static async list<TCtor extends CtorAny>(
    this: HS<TCtor>,
    env: Env,
    cursor?: string | null,
    limit?: number
  ): Promise<{ items: IS<TCtor>[]; next: string | null }> {
    const idx = new Index<string>(env, this.indexName);
    const { items: ids, next } = await idx.page(cursor, limit);
    const rows = (await Promise.all(ids.map((id) => new this(env, id).getState()))) as IS<TCtor>[];
    return { items: rows, next };
  }

  static async ensureSeed<TCtor extends CtorAny>(this: HS<TCtor>, env: Env): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
    const ids = await idx.list();
    const seeds = this.seedData;
    if (ids.length === 0 && seeds && seeds.length > 0) {
      await Promise.all(seeds.map(s => new this(env, this.keyOf(s)).save(s)));
      await idx.addBatch(seeds.map(s => this.keyOf(s)));
    }
  }

  static async delete<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const existed = await inst.delete();
    const idx = new Index<string>(env, this.indexName);
    await idx.remove(id);
    return existed;
  }

  static async deleteMany<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const results = await Promise.all(ids.map(async (id) => new this(env, id).delete()));
    const idx = new Index<string>(env, this.indexName);
    await idx.removeBatch(ids);
    return results.filter(Boolean).length;
  }

  static async removeFromIndex<TCtor extends CtorAny>(this: HS<TCtor>, env: Env, id: string): Promise<void> {
    const idx = new Index<string>(env, this.indexName);
    await idx.remove(id);
  }

  protected override async ensureState(): Promise<S> {
    const s = (await super.ensureState()) as S;
    if (!s.id) {
      const withId = { ...s, id: this.id } as S;
      this._state = withId;
      return withId;
    }
    return s;
  }
}

// API HELPERS
export const ok = <T>(c: Context, data: T) => c.json({ success: true, data } as ApiResponse<T>);
export const bad = (c: Context, error: string) => c.json({ success: false, error } as ApiResponse, 400);
export const notFound = (c: Context, error = 'not found') => c.json({ success: false, error } as ApiResponse, 404);
export const isStr = (s: unknown): s is string => typeof s === 'string' && s.length > 0;