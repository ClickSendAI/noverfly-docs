# Migrations SQL & Background Jobs

Documentation ops pour déploiement Noverfly Cloud.

## Migrations Prisma (mai 2026)

| Migration | Feature |
|-----------|---------|
| `20260508000000_add_live_streams` | Live streaming |
| `20260518110000_client_apps_incoming_call_push` | Client apps + push calls |
| `20260520120000_music_gateway` | Music Gateway |
| `20260522181500_filterkit_cloud` | Filter Kit |
| `20260522190000_ai_cloud_service` | AI Cloud |
| `20260524130000_devapi_automation_cloud` | DevAPI automation |
| `20260528120000_cloud_programmable_scripts` | Cloud scripts |

Commande : `npx prisma migrate deploy`

## Migrations manuelles

Dossier `prisma/migrations_manual/` — appliquer après review DBA si absent du migrate standard.

## Background Jobs (BullMQ)

| Queue | Usage |
|-------|-------|
| `send-push` | FCM, APNs, Expo, Web Push |
| `devapi-automation` | Workflows cloud, **`script_collection_trigger`**, cron DevAPI |
| `ai-cloud` | Jobs AI async |
| `follow-fanout` | Social fan-out |
| `send-digest` | Notification digest |
| `publish-site` | CDN publish |

Job `script_collection_trigger` : après CRUD record Data API → exécute scripts avec triggers `onCreate`/`onUpdate`/`onDelete`.

Guide : [cloud-scripts-operational-guide.md](cloud-scripts-operational-guide.md)

Redis requis : `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
