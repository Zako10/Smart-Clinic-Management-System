# Smart Clinic Frontend

A focused clinic workspace for staff to manage patients, appointments, invoices, and payments.

The frontend is intentionally simple: Vite serves a small vanilla JavaScript app with one stylesheet and one image asset. There is no unused React or TypeScript layer to maintain.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Production

For a separately hosted backend, create `.env.production`:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

Then build:

```bash
npm run build
```

Deploy the generated `dist/` folder to any static host.

## Local Backend

Development uses the Vite proxy in `vite.config.js`.

```env
VITE_API_BASE_URL=/api
```

The proxy forwards `/api/*` to `http://localhost:5004`, matching the ASP.NET Core launch profile.

## Architecture

```text
src/
  assets/
    hero.png
  main.js
  styles.css
```
