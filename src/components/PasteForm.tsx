'use client';

import { useState } from 'react';

export default function PasteForm() {
    const [content, setContent] = useState('');
    const [ttlSeconds, setTtlSeconds] = useState('');
    const [maxViews, setMaxViews] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [pasteUrl, setPasteUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setPasteUrl('');
        setIsLoading(true);

        try {
            const body: any = { content };

            if (ttlSeconds) {
                const ttl = parseInt(ttlSeconds, 10);
                if (isNaN(ttl) || ttl < 1) {
                    setError('TTL must be a positive integer');
                    setIsLoading(false);
                    return;
                }
                body.ttl_seconds = ttl;
            }

            if (maxViews) {
                const views = parseInt(maxViews, 10);
                if (isNaN(views) || views < 1) {
                    setError('Max views must be a positive integer');
                    setIsLoading(false);
                    return;
                }
                body.max_views = views;
            }

            const response = await fetch('/api/pastes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to create paste');
                setIsLoading(false);
                return;
            }

            setPasteUrl(data.url);
            setContent('');
            setTtlSeconds('');
            setMaxViews('');
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pasteUrl);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Create a Paste
                    </h1>
                    <p className="text-gray-600">Share text snippets with optional expiry and view limits</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                            Paste Content *
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                            rows={12}
                            placeholder="Enter your text here..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="ttl" className="block text-sm font-semibold text-gray-700 mb-2">
                                Time to Live (seconds)
                            </label>
                            <input
                                id="ttl"
                                type="number"
                                value={ttlSeconds}
                                onChange={(e) => setTtlSeconds(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Optional (e.g., 3600)"
                                min="1"
                            />
                            <p className="mt-1 text-xs text-gray-500">Leave empty for no expiry</p>
                        </div>

                        <div>
                            <label htmlFor="maxViews" className="block text-sm font-semibold text-gray-700 mb-2">
                                Maximum Views
                            </label>
                            <input
                                id="maxViews"
                                type="number"
                                value={maxViews}
                                onChange={(e) => setMaxViews(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Optional (e.g., 10)"
                                min="1"
                            />
                            <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited views</p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {pasteUrl && (
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-semibold text-green-900 mb-3">✓ Paste created successfully!</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={pasteUrl}
                                    readOnly
                                    className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg text-sm font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !content.trim()}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                        {isLoading ? 'Creating Paste...' : 'Create Paste'}
                    </button>
                </form>
            </div>
        </div>
    );
}
