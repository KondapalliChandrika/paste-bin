# Pastebin-Lite

A lightweight Pastebin-like application for sharing text snippets with optional expiry and view limits. Built with Next.js 14+ and PostgreSQL.

## Features

- **Create Text Pastes**: Share arbitrary text content with a unique URL
- **Time-Based Expiry (TTL)**: Optionally set pastes to expire after a specified duration
- **View Count Limits**: Optionally limit how many times a paste can be viewed
- **Combined Constraints**: Use both TTL and view limits; paste becomes unavailable when either triggers
- **Automated Testing Support**: Deterministic time testing via `TEST_MODE` and `x-test-now-ms` header
- **Auto-Database Creation**: Automatically creates database tables on first run

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via @vercel/postgres)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## How to Run Locally

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or remote)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/KondapalliChandrika/paste-bin.git
   cd paste-bin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**


   Edit `.env.local` and add your PostgreSQL connection string:
   ```env
   POSTGRES_URL="postgres://username:password@localhost:5432/pastebin"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

   **Note**: If you don't have PostgreSQL installed locally, you can:
   - Install PostgreSQL locally
   - Use a free PostgreSQL service like [Neon](https://neon.tech) or [Supabase](https://supabase.com)
   - Create a Vercel Postgres database (requires Vercel account)

4. **Run the development server**
   ```bash
   npm start
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

**The application automatically creates the database table on first run.** No manual migrations are needed!

When you first access the app or call `/api/healthz`, the application will:
1. Check if the `pastes` table exists
2. Create it if it doesn't exist
3. Set up necessary indexes

## Persistence Layer

### PostgreSQL Database

This application uses **PostgreSQL** as its persistence layer for the following reasons:

1. **Structured Data**: Pastes have a well-defined schema with multiple fields
2. **Atomic Operations**: PostgreSQL ensures view count increments are atomic, preventing race conditions
3. **Automatic Table Creation**: The app checks for table existence and creates it programmatically
4. **Serverless Compatible**: Works seamlessly with Vercel Postgres in production
5. **Reliable**: Data persists across serverless function invocations

### Database Schema

```sql
CREATE TABLE pastes (
  id VARCHAR(255) PRIMARY KEY,      -- Unique paste identifier (10-char nanoid)
  content TEXT NOT NULL,            -- Paste content
  created_at BIGINT NOT NULL,       -- Creation timestamp (ms since epoch)
  ttl_seconds INTEGER,              -- Time-to-live in seconds (nullable)
  max_views INTEGER,                -- Maximum view count (nullable)
  view_count INTEGER DEFAULT 0      -- Current view count
);
```

## API Endpoints

### Health Check

```bash
GET /api/healthz
```

Returns:
```json
{ "ok": true }
```

### Create Paste

```bash
POST /api/pastes
Content-Type: application/json

{
  "content": "Hello, World!",
  "ttl_seconds": 3600,    // Optional: expire in 1 hour
  "max_views": 5          // Optional: max 5 views
}
```

Response (201):
```json
{
  "id": "abc123xyz",
  "url": "https://your-app.vercel.app/p/abc123xyz"
}
```

### Fetch Paste (API)

```bash
GET /api/pastes/:id
```

Response (200):
```json
{
  "content": "Hello, World!",
  "remaining_views": 4,               // null if unlimited
  "expires_at": "2026-01-01T00:00:00.000Z"  // null if no TTL
}
```

**Note**: Each API fetch increments the view count.

### View Paste (HTML)

```bash
GET /p/:id
```

Returns an HTML page displaying the paste content, or 404 if unavailable.

## Design Decisions

### 1. **Next.js App Router**
   - Modern React Server Components for optimal performance
   - Built-in API routes eliminate need for separate backend
   - Excellent Vercel deployment integration

### 2. **PostgreSQL for Persistence**
   - Chosen over in-memory storage for serverless compatibility
   - Atomic operations prevent view count race conditions
   - Structured schema provides data integrity

### 3. **Automatic Database Creation**
   - Application checks for table existence on startup
   - Creates tables automatically if missing
   - No manual migrations required, simplifying deployment

### 4. **Deterministic Time Testing (TEST_MODE)**
   - Supports `x-test-now-ms` header when `TEST_MODE=1`
   - Enables automated testing of TTL expiry without waiting
   - Production behavior unchanged when TEST_MODE is off

### 5. **ID Generation with nanoid**
   - Short, URL-safe unique identifiers (10 characters)
   - Collision-resistant
   - More user-friendly than UUIDs

### 6. **View Count Before Availability Check**
   - View count increments on successful API fetch
   - Checked before returning paste data
   - Ensures accurate remaining view calculation

### 7. **Combined Constraints Logic**
   - Pastes become unavailable when EITHER constraint triggers
   - Checked in order: view limit first, then TTL
   - All unavailable pastes return 404 (not 410/403)

### 8. **XSS Protection**
   - Content rendered inside `<pre><code>` tags
   - React automatically escapes content
   - No dangerouslySetInnerHTML used

## Deployment to Vercel

1. **Push code to GitHub**

2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add Vercel Postgres**
   - In your Vercel project dashboard, go to "Storage"
   - Create a new Postgres database
   - Vercel automatically sets environment variables

4. **Deploy**
   - Vercel automatically deploys on push
   - Database tables are created on first request

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_BASE_URL` | Base URL for paste links | No (auto-detected) |
| `TEST_MODE` | Enable deterministic time testing | No (default: off) |

## Testing

### Manual Testing

1. **Create a paste**:
   ```bash
   curl -X POST http://localhost:3000/api/pastes \
     -H "Content-Type: application/json" \
     -d '{"content":"Test paste"}'
   ```

2. **Fetch a paste**:
   ```bash
   curl http://localhost:3000/api/pastes/{id}
   ```

3. **View limit test**:
   ```bash
   # Create paste with max_views=1
   curl -X POST http://localhost:3000/api/pastes \
     -H "Content-Type: application/json" \
     -d '{"content":"One view only","max_views":1}'
   
   # First fetch: 200 OK
   # Second fetch: 404 Not Found
   ```

4. **TTL test with TEST_MODE**:
   Set `TEST_MODE=1` in `.env.local`, then:
   ```bash
   # Create paste that expires in 60 seconds
   curl -X POST http://localhost:3000/api/pastes \
     -H "Content-Type: application/json" \
     -d '{"content":"Expires soon","ttl_seconds":60}'
   
   # Fetch before expiry (use current time)
   curl http://localhost:3000/api/pastes/{id} \
     -H "x-test-now-ms: $(date +%s)000"
   
   # Fetch after expiry (add 61000ms)
   curl http://localhost:3000/api/pastes/{id} \
     -H "x-test-now-ms: $(($(date +%s)000 + 61000))"
   ```

