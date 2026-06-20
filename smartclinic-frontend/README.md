# Smart Clinic Frontend

Vanilla HTML, CSS, and JavaScript dashboard for the Smart Clinic Management System backend.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Backend URL

Development uses the Vite proxy in `vite.config.ts`.

```env
VITE_API_BASE_URL=/api
```

The proxy forwards `/api/*` to `http://localhost:5004`, matching the ASP.NET Core launch profile.

## Architecture

```text
src/
  main.js
  styles.css
```
