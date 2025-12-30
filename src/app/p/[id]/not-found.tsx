import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                <div className="mb-6">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Paste Not Found</h1>
                    <p className="text-gray-600">
                        This paste doesn't exist, has expired, or has reached its view limit.
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                    Create New Paste
                </Link>
            </div>
        </main>
    );
}
