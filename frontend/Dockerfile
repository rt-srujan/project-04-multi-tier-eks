# WHY multi-stage build? We use Nginx to serve static HTML — we don't need Node.js
# at runtime. Multi-stage = build in one stage, copy only what's needed to final stage.
# Result: tiny production image.

# Stage 1: Just copy our files (no build step needed for plain HTML)
FROM nginx:1.25-alpine

# Remove default Nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy our HTML app
COPY index.html /usr/share/nginx/html/

# Copy our custom Nginx config (the one that proxies /api/ to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 80 is where Nginx listens
EXPOSE 80

# Nginx starts automatically — this is the default CMD for the nginx image
CMD ["nginx", "-g", "daemon off;"]