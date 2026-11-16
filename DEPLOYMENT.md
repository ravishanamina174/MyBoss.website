# Production deployment

This repository is prepared for a split deployment:

- Frontend: Vercel, using [`frontend/`](/Users/raveesha/MyProjects/MyBoss/frontend) as the Root Directory.
- Backend: Render Docker service, using [`backend/`](/Users/raveesha/MyProjects/MyBoss/backend) as the Docker build context.
- Database: Neon PostgreSQL production branch.
- Authentication: Clerk production instance.

## Neon: protect the production branch

1. Keep `development` and `production` as separate Neon branches.
2. Before deploying, take a Neon backup/snapshot and verify that the production branch is selected.
3. In the production branch, copy the pooled connection string and split it into `DB_URL` (a JDBC URL such as `jdbc:postgresql://HOST/DB?sslmode=require`), `DB_USERNAME`, and `DB_PASSWORD`.
4. Do not run `flyway clean`, `DROP SCHEMA`, `DROP DATABASE`, or reset commands against either branch.
5. Flyway applies pending versioned migrations on startup and preserves existing rows. Never edit an applied migration. Add a new `V4__...sql` migration for future changes, test it on `development`, then apply it to `production` during a controlled deploy.
6. Confirm the production database has Flyway history for `V1`, `V2`, and `V3` before starting the service. A new empty branch will receive these migrations on startup.

## Render backend

Create a Render Web Service from this repository:

- Runtime: Docker
- Root Directory: `backend`
- Dockerfile: `backend/Dockerfile`
- Health Check Path: `/actuator/health`
- No manual port setting is required; the service listens on Render's `PORT` (default `8080` locally).

The Dockerfile builds with Java 21 and starts the Spring Boot jar. Set these Render environment variables:

| Variable | Value/source |
| --- | --- |
| `DB_URL` | Neon production branch JDBC URL |
| `DB_USERNAME` | Neon production role |
| `DB_PASSWORD` | Neon production password |
| `CLERK_ISSUER` | Clerk production instance issuer URL |
| `CLERK_JWKS_URI` | Clerk production JWKS URL, normally `${CLERK_ISSUER}/.well-known/jwks.json` |
| `CORS_ALLOWED_ORIGINS` | Exact Vercel production origin, for example `https://your-app.vercel.app` |
| `APP_FRONTEND_URL` | Exact Vercel production origin used in invitation links |

Do not set `PORT` manually unless required by Render. Do not commit any of these values.

## Vercel frontend

Import the repository into Vercel with:

- Root Directory: `frontend`
- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm ci`
- Output Directory: leave the Next.js default

Set these Vercel Production environment variables:

| Variable | Value/source |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Render backend public URL, without a trailing slash |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk production instance publishable key |
| `CLERK_SECRET_KEY` | Clerk production instance secret key used by the Clerk Next.js server integration |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` |

Redeploy after changing environment variables. `NEXT_PUBLIC_API_URL` is embedded into the frontend build, so it must be present for the production build.

## Clerk production configuration

1. Use a Clerk production instance, not the current development issuer.
2. Add the Vercel production domain and any custom domain to Clerk's allowed origins/application domains.
3. Configure Clerk sign-in, sign-up, and redirect URLs for the Vercel domain.
4. Use the production issuer and JWKS URL in Render's `CLERK_ISSUER` and `CLERK_JWKS_URI`.
5. Set `CORS_ALLOWED_ORIGINS` and `APP_FRONTEND_URL` to the same exact HTTPS origin. If a custom domain is added, use that origin instead of (or in addition to) the Vercel origin.

## Verification

From the repository root:

```bash
cd backend
./mvnw test
./mvnw package

cd ../frontend
npm run lint
npx tsc --noEmit
npm run build
```

After deployment, verify `https://<render-host>/actuator/health` returns a healthy response, then verify the frontend can sign in and call the backend.
