import { NextResponse } from 'next/server';
import { checkDatabaseHealth, initializeDatabase } from '@/lib/db';

export async function GET() {
    try {
        // Initialize database (create tables if they don't exist)
        await initializeDatabase();

        // Check database connectivity
        const isHealthy = await checkDatabaseHealth();

        return NextResponse.json(
            { ok: isHealthy },
            { status: isHealthy ? 200 : 503 }
        );
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json(
            { ok: false },
            { status: 503 }
        );
    }
}
