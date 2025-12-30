import { sql } from '@vercel/postgres';

export interface Paste {
    id: string;
    content: string;
    created_at: number;
    ttl_seconds: number | null;
    max_views: number | null;
    view_count: number;
}

/**
 * Initialize the database and create the pastes table if it doesn't exist
 */
export async function initializeDatabase(): Promise<boolean> {
    try {
        // Check if the pastes table exists
        const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pastes'
      );
    `;

        const tableExists = result.rows[0]?.exists;

        if (!tableExists) {
            // Create the pastes table
            await sql`
        CREATE TABLE pastes (
          id VARCHAR(255) PRIMARY KEY,
          content TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          ttl_seconds INTEGER,
          max_views INTEGER,
          view_count INTEGER DEFAULT 0 NOT NULL
        );
      `;

            // Create an index on created_at for potential cleanup queries
            await sql`
        CREATE INDEX idx_pastes_created_at ON pastes(created_at);
      `;

            console.log('Database table "pastes" created successfully');
        }

        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
        return false;
    }
}

/**
 * Check database connectivity
 */
export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        await sql`SELECT 1;`;
        return true;
    } catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
}

/**
 * Create a new paste
 */
export async function createPaste(
    id: string,
    content: string,
    ttlSeconds: number | null,
    maxViews: number | null
): Promise<void> {
    const createdAt = Date.now();

    await sql`
    INSERT INTO pastes (id, content, created_at, ttl_seconds, max_views, view_count)
    VALUES (${id}, ${content}, ${createdAt}, ${ttlSeconds}, ${maxViews}, 0);
  `;
}

/**
 * Get a paste by ID
 */
export async function getPaste(id: string): Promise<Paste | null> {
    const result = await sql<Paste>`
    SELECT id, content, created_at, ttl_seconds, max_views, view_count
    FROM pastes
    WHERE id = ${id};
  `;

    return result.rows[0] || null;
}

/**
 * Increment the view count for a paste
 */
export async function incrementViewCount(id: string): Promise<void> {
    await sql`
    UPDATE pastes
    SET view_count = view_count + 1
    WHERE id = ${id};
  `;
}


