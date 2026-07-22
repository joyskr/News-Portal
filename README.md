# News Portal

A zero-upfront-cost news portal starter using a Next.js frontend, Node/Express API, PostgreSQL on Railway, Netlify hosting for the frontend, and Railway hosting for the backend.

The portal updates itself from RSS feeds, stores articles in Postgres, and supports optional user accounts. Visitors can browse headlines without signing in.

## Architecture

- `frontend/` - Next.js app designed for Netlify deployment.
- `backend/` - Express API designed for Railway deployment.
- `backend/db/schema.sql` - Postgres schema for users and articles.
- RSS feeds are configured with the `RSS_FEEDS` environment variable.
- Authentication uses HMAC-signed JWTs and Node.js `crypto.scrypt` password hashing, avoiding native or blocked auth packages.
- Signed-in users can save article bookmarks, but accounts are never required for browsing.

## Local setup

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev --workspace backend
npm run dev --workspace frontend
npm test --workspace backend
```

Set `DATABASE_URL` to your local or Railway Postgres connection string before starting the backend.

## Quality checks

```bash
npm run lint --workspace backend
npm test --workspace backend
npm run lint --workspace frontend
npm run build --workspace frontend
```

GitHub Actions installs workspace dependencies without lifecycle scripts, then runs backend syntax checks, backend tests, frontend linting, and a frontend build on pushes to `main`/`master` and pull requests.

## Railway backend deployment

1. Create a Railway project.
2. Add a PostgreSQL database.
3. Add a backend service from this repository and set the root directory to `backend`.
4. Configure environment variables:
   - `DATABASE_URL` from Railway Postgres.
   - `JWT_SECRET` as a long random string.
   - `FRONTEND_ORIGIN` with your Netlify URL.
   - `RSS_FEEDS` as a comma-separated list of feed URLs.
   - `REFRESH_TOKEN` as a long random token for manual refresh requests.
5. Deploy with start command `npm start`.

The backend runs database migrations on startup and refreshes RSS feeds immediately, then every `NEWS_REFRESH_MINUTES` minutes.

## Netlify frontend deployment

1. Create a Netlify site from this repository.
2. Set the base directory to `frontend`.
3. Use build command `npm run build`.
4. Use publish directory `.next`.
5. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL.
6. If Netlify has an old failed deploy, trigger **Clear cache and deploy site** after changing build settings or dependencies.

## API endpoints

- `GET /health` - Health check.
- `GET /api/articles` - List articles. Supports `category`, `search`, and `limit` query parameters.
- `POST /api/refresh` - Manually refresh RSS feeds. In production, send `x-refresh-token` matching `REFRESH_TOKEN`.
- `POST /api/auth/register` - Create an optional account.
- `POST /api/auth/login` - Sign in to an optional account.
- `GET /api/me/bookmarks` - List saved articles for signed-in users.
- `POST /api/me/bookmarks/:articleId` - Save an article for a signed-in user.
- `DELETE /api/me/bookmarks/:articleId` - Remove a saved article for a signed-in user.

## Notes

This starter links users to original publishers instead of copying full articles. Review each source's terms before using its feed in production.
