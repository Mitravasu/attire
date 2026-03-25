# Deployment Notes

## Topology

- `frontend` is built into static assets and served by Nginx
- `backend` runs on port `3001`
- `cloudflared` exposes the Nginx host through Cloudflare Tunnel

## Routing

- frontend routes are handled through Nginx history fallback
- API traffic is proxied from `/api/*` to the backend
- uploaded files are proxied from `/uploads/*` to the backend

## Environment

Frontend:

- `VITE_API_URL=/api`

Backend:

- `PORT=3001`
- `CLIENT_ORIGIN=http://localhost:5173`

## Release Checklist

- build the frontend
- publish the build output to the Nginx web root
- start the backend
- reload Nginx with `nginx/attire.conf`
- start `cloudflared` with `cloudflared/config.yml`
- verify `/`, `/outfits`, `/planner`, and `/api/health`
