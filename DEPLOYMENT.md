# Deployment Guide for Pastebin-Lite

This guide walks you through deploying the Pastebin-Lite application to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works fine)
- Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Push Code to GitHub

If you haven't already:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Pastebin-Lite application"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Sign Up/Login to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or login (preferably with your GitHub account)

### 3. Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Find and select your `pastebin-lite` repository
4. Click **"Import"**

### 4. Configure Your Project

Vercel will auto-detect Next.js. The default settings should work:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

Click **"Deploy"** (but don't worry, it will fail without a database - that's expected!)

### 5. Add PostgreSQL Database

After the initial deployment attempt:

1. In your Vercel project dashboard, go to the **"Storage"** tab
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose a database name (e.g., `pastebin-db`)
5. Select a region (choose one close to your users)
6. Click **"Create"**

Vercel will automatically:
- Create the PostgreSQL database
- Set the required environment variables (`POSTGRES_URL`, etc.)
- Connect your project to the database

### 6. Set Environment Variables (Optional)

If you need to enable TEST_MODE:

1. Go to **"Settings"** → **"Environment Variables"**
2. Add a new variable:
   - **Name**: `TEST_MODE`
   - **Value**: `1`
   - **Environment**: Select where to apply (Production/Preview/Development)
3. Click **"Save"**

**Note**: For production, you typically DON'T want TEST_MODE enabled.

### 7. Redeploy

After adding the database:

1. Go to the **"Deployments"** tab
2. Click the three dots (...) on the latest deployment
3. Click **"Redeploy"**

OR simply push a new commit to trigger redeployment:

```bash
git commit --allow-empty -m "Trigger redeployment"
git push
```

### 8. Verify Deployment

Once deployed:

1. Click **"Visit"** to open your deployed app
2. Test the health endpoint: `https://your-app.vercel.app/api/healthz`
3. Create a test paste through the UI
4. Verify the paste can be viewed

### 9. Database Auto-Creation

On first request to any API endpoint, the application will:
1. Check if the `pastes` table exists
2. Create it automatically if it doesn't exist
3. Set up necessary indexes

**No manual database migration is needed!**

## Obtaining Your Deployed URL

After deployment, your URL will be:
```
https://YOUR_PROJECT_NAME.vercel.app
```

You can also set up a custom domain:
1. Go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Automated Testing

Your deployed application URL is what you'll submit for automated testing. The grading system will:

1. Test health endpoint: `GET https://your-app.vercel.app/api/healthz`
2. Create pastes: `POST https://your-app.vercel.app/api/pastes`
3. Fetch pastes: `GET https://your-app.vercel.app/api/pastes/:id`
4. Test view limits and TTL expiry
5. Verify TEST_MODE support with `x-test-now-ms` header

## Troubleshooting

### Build Fails

- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors locally: `npm run build`

### Database Connection Issues

- Ensure Postgres database is created in Vercel Storage
- Check that environment variables are set (Settings → Environment Variables)
- Redeploy after adding database

### 404 on API Routes

- Verify routes are deployed: Check Deployments → Functions
- Test locally first: `npm run dev`
- Check Next.js version is 14+

### Application Works Locally but Not on Vercel

- Ensure `POSTGRES_URL` is set in Vercel environment variables
- Check that you're not using absolute localhost URLs in code
- Review server logs: Deployments → [Latest] → Runtime Logs

## Monitoring

Vercel provides:
- **Analytics**: Track page views and performance
- **Logs**: View runtime logs for debugging
- **Metrics**: Monitor function execution time and errors

Access these in your project dashboard.

## Cost

- **Vercel Hobby Plan**: FREE
  - Unlimited projects
  - 100GB bandwidth
  - Serverless functions
  - SSL certificates

- **Vercel Postgres**:
  - Free tier: 256 MB storage, 60 compute hours/month
  - Sufficient for testing and small projects

## Next Steps

After successful deployment:

1. ✅ Test all API endpoints with your deployed URL
2. ✅ Share your deployed URL for assignment submission
3. ✅ Test with the automated grading system
4. ✅ Monitor logs for any issues

## Support

If you encounter issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)
- Check Vercel community forums
