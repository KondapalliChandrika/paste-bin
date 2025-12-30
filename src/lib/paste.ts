import { Paste } from './db';
import { isPasteExpired } from './time';

/**
 * Check if a paste is available based on view limits and TTL
 */
export function isPasteAvailable(
    paste: Paste,
    currentTime: number
): boolean {
    // Check if the paste has exceeded its view limit
    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
        return false;
    }

    // Check if the paste has expired
    if (isPasteExpired(paste.created_at, paste.ttl_seconds, currentTime)) {
        return false;
    }

    return true;
}

/**
 * Calculate remaining views for a paste
 */
export function getRemainingViews(paste: Paste): number | null {
    if (paste.max_views === null) {
        return null;
    }

    const remaining = paste.max_views - paste.view_count;
    return Math.max(0, remaining);
}

/**
 * Validate paste creation input
 */
export interface PasteInput {
    content: string;
    ttl_seconds?: number;
    max_views?: number;
}

export interface ValidationError {
    error: string;
}

export function validatePasteInput(input: any): PasteInput | ValidationError {
    // Check if content exists and is a non-empty string
    if (!input.content || typeof input.content !== 'string' || input.content.trim() === '') {
        return { error: 'content is required and must be a non-empty string' };
    }

    // Validate ttl_seconds if provided
    if (input.ttl_seconds !== undefined) {
        if (typeof input.ttl_seconds !== 'number' || !Number.isInteger(input.ttl_seconds) || input.ttl_seconds < 1) {
            return { error: 'ttl_seconds must be an integer >= 1' };
        }
    }

    // Validate max_views if provided
    if (input.max_views !== undefined) {
        if (typeof input.max_views !== 'number' || !Number.isInteger(input.max_views) || input.max_views < 1) {
            return { error: 'max_views must be an integer >= 1' };
        }
    }

    return {
        content: input.content,
        ttl_seconds: input.ttl_seconds,
        max_views: input.max_views,
    };
}
