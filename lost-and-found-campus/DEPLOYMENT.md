# Deployment

Render is the recommended host for this app because it is a long-running Express server with Socket.IO. Vercel is best for serverless apps and is a poor fit for the real-time chat server.

## Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repo.
3. Render should use the root `render.yaml`, which points the web service at `lost-and-found-campus`.
4. Add the secret environment variables that are marked `sync: false` in `render.yaml`:
   - `FRONTEND_URL`: your Render web URL after the first deploy, for example `https://lost-and-found-campus.onrender.com`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. Deploy. Render will run:
   - `npm ci`
   - `npm run prisma:deploy`
   - `npm start`

## Manual Render settings

If you do not use the Blueprint:

- Root Directory: `lost-and-found-campus`
- Build Command: `npm ci && npm run prisma:deploy`
- Start Command: `npm start`
- Add a Render PostgreSQL database and set `DATABASE_URL` to its internal connection string.
- Set `NODE_ENV=production`, `JWT_SECRET`, `SESSION_SECRET`, `JWT_EXPIRE=7d`, email variables, Cloudinary variables, and `FRONTEND_URL`.

## Email on Render Free

Render Free web services block outbound traffic on SMTP ports `25`, `465`, and `587`. If you use Gmail SMTP, use a paid Render web service. If you stay on the free web service, use an email provider that supports another SMTP port such as `2525`, or switch the app to an email API provider.

## Local production check

```bash
npm install
npm run prisma:generate
npm start
```
