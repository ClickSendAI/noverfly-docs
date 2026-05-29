# Live Streaming — DevAPI Cloud

Service live professionnel intégré à Noverfly Cloud. Auth **GFK secret** (`X-Api-Key: gfk_...`) avec `siteId` résolu depuis la clé.

Base URL : `https://api.noverfly.com`

## Prérequis

- Clé API **SECRET** (`gfk_...`) attachée à un site
- Feature plan : `live_enabled`
- Header : `X-Api-Key: gfk_YOUR_KEY`

## Cycle de vie d'un stream

```
CREATE (DRAFT) → START (LIVE) → END (ENDED)
                      ↑
              uplink-connected / preflight / heartbeat
```

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/v1/cloud/live/streams` | Liste streams (`?status=LIVE,DRAFT&limit=20`) |
| POST | `/v1/cloud/live/streams` | Créer un stream |
| GET | `/v1/cloud/live/streams/:id` | Détail stream |
| POST | `/v1/cloud/live/streams/:id/start` | Démarrer (live) |
| POST | `/v1/cloud/live/streams/:id/end` | Terminer |
| POST | `/v1/cloud/live/streams/:id/uplink-connected` | Confirmer uplink encodage |
| GET | `/v1/cloud/live/streams/:id/playback` | URLs playback (HLS/DASH) |
| POST | `/v1/cloud/live/streams/:id/viewer-heartbeat` | Heartbeat spectateur |
| GET | `/v1/cloud/live/streams/:id/diagnostics` | Diagnostics pipeline |
| POST | `/v1/cloud/live/streams/:id/preflight` | Test pré-live |

Alias courts : `GET/POST /api/live/:id/diagnostics`, `/api/live/:id/preflight`

## Créer un stream

```bash
curl -X POST "https://api.noverfly.com/v1/cloud/live/streams" \
  -H "X-Api-Key: gfk_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Live boutique Kinstore",
    "description": "Promo du jour",
    "requestedQuality": "420p",
    "clientRequestId": "live-create-20260525-001",
    "creatorProfile": {
      "userId": "user_123",
      "displayName": "Jeariss",
      "avatarUrl": "https://cdn.example.com/avatar.jpg"
    }
  }'
```

### Idempotence

- Header `Idempotency-Key` ou body `clientRequestId` (8–200 caractères)
- Réponse dupliquée : `{ ..., "_idempotent": true }`

## Démarrer et playback

```bash
curl -X POST "https://api.noverfly.com/v1/cloud/live/streams/STREAM_ID/start" \
  -H "X-Api-Key: gfk_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "streamKey": "optional-override" }'

curl "https://api.noverfly.com/v1/cloud/live/streams/STREAM_ID/playback" \
  -H "X-Api-Key: gfk_YOUR_KEY"
```

## Erreurs courantes

| Code | Signification |
|------|---------------|
| `MISSING_API_KEY` | Header `X-Api-Key` absent |
| `GFK_REQUIRED` | Clé publique utilisée — secret requis |
| `SITE_CONTEXT_REQUIRED` | GFK non lié à un site |
| `FEATURE_NOT_AVAILABLE` | Plan sans `live_enabled` |
| `REQUEST_IN_PROGRESS` | Idempotency key en cours |

## Pipeline interne

Voir spec interne : `infra/flivex/LIVE_PIPELINE_SPEC.md`

Tables : migration `20260508000000_add_live_streams`, `20260514120000_live_stream_professional_status`
