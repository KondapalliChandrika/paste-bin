import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PasteData {
    content: string;
    remaining_views: number | null;
    expires_at: string | null;
}

async function getPasteData(id: string): Promise<PasteData | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/pastes/${id}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching paste:', error);
        return null;
    }
}

export default async function PastePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const pasteData = await getPasteData(id);

    if (!pasteData) {
        notFound();
    }

    const formatExpiryDate = (isoString: string | null) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        ← Create New Paste
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Paste Content
                        </h1>

                        <div className="flex flex-wrap gap-3 text-sm">
                            {pasteData.remaining_views !== null && (
                                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <span className="font-semibold text-blue-900">
                                        {pasteData.remaining_views} {pasteData.remaining_views === 1 ? 'view' : 'views'} remaining
                                    </span>
                                </div>
                            )}

                            {pasteData.expires_at && (
                                <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                                    <span className="font-semibold text-purple-900">
                                        Expires: {formatExpiryDate(pasteData.expires_at)}
                                    </span>
                                </div>
                            )}

                            {pasteData.remaining_views === null && !pasteData.expires_at && (
                                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="font-semibold text-green-900">
                                        No restrictions
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-x-auto">
                            <code className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
                                {pasteData.content}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>
        </main>
    );
}
