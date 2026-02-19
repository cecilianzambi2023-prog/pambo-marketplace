# Kenya 1M+ Scale Readiness (Phase 1 Foundation)

This project is Kenya-first, designed to scale toward 1M+ concurrent users.

## Implemented in this phase

- In-memory scale metrics collector (request counts + latency distribution)
- Request metrics middleware on backend APIs
- Event queue scaffold with worker consumption pattern
- Kenya-focused matchmaking ranking API scaffold (`/api/matchmaking/search`)
- Event emission hooks for key demand signals

## Core Kenya SLO targets

- API latency p95 < 250ms
- Matchmaking search p95 < 180ms
- Checkout success > 97%
- Error rate < 1% on core flows

## Next implementation layers

1. Replace in-memory queue with Redis / Kafka
2. Add Redis caching for hot listings and matchmaking responses
3. Add Supabase read replicas and query budget limits
4. Add fraud/risk scoring pipeline for seller and payment events
5. Add autoscaling + canary deploy strategy

## Operational endpoints

- `GET /api/metrics` (optional `x-metrics-token` header)
- `GET /api/matchmaking/health`
- `GET /api/matchmaking/search?hub=marketplace&query=tv&county=Nairobi&limit=20`

## Runbook

- Start backend: `cd backend && npm run dev`
- Validate health: `curl http://localhost:5000/api/health`
- Validate matchmaking: `curl "http://localhost:5000/api/matchmaking/search?hub=marketplace&query=phone&county=Nairobi&limit=10"`
- Inspect metrics: `curl http://localhost:5000/api/metrics`
