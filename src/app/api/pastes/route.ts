import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { initializeDatabase, createPaste } from '@/lib/db';
import { validatePasteInput } from '@/lib/paste';

export async function POST(request: NextRequest) {
    try {
        // Initialize database (create tables if they don't exist)
        await initializeDatabase();

        // Parse request body
        const body = await request.json();

        // Validate input
        const validationResult = validatePasteInput(body);
        if ('error' in validationResult) {
            return NextResponse.json(
                { error: validationResult.error },
                { status: 400 }
            );
        }

        // Generate unique ID
        const id = nanoid(10);

        // Create paste
        await createPaste(
            id,
            validationResult.content,
            validationResult.ttl_seconds ?? null,
            validationResult.max_views ?? null
        );

        // Get the base URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`;

        const url = `${baseUrl}/p/${id}`;

        return NextResponse.json(
            { id, url },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create paste error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
