# syntax = docker/dockerfile:1

FROM oven/bun:1.3.0-slim AS base

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV DO_NOT_TRACK=1

ARG PG_VERSION="17"
RUN apt-get update && \
    apt-get install -y postgresql-common

RUN yes "" | /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh

RUN apt-get install -y postgresql-client-${PG_VERSION} && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Throw-away build stage to reduce size of final image
FROM base AS builder

# Install node modules
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build the project
RUN bun run build


# Final stage for app image
FROM base AS runner

# Don't run production as root
RUN addgroup --system --gid 998 railway 
RUN adduser --system --uid 998 railwayuser 
USER railwayuser 

# Copy built application
COPY --from=builder --chown=railwayuser:railway /app/dist/ /app/

# Start the server by default, this can be overwritten at runtime
CMD pg_isready --dbname=$DATABASE_URL && pg_dump --version && ./server
