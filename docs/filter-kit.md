# Filter Kit Cloud — DevAPI

Infrastructure multi-tenant : chaque client utilise `X-Api-Key: gfk_...` pour accéder au catalogue filtres sans exposer les secrets Banuba/Snap/OpenCV côté serveur.

Module : `src/modules/filterkit/`

## Endpoints client (GFK)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/v1/cloud/filter-kit/sdk/bootstrap?appId=...` | Bootstrap SDK |
| GET | `/v1/cloud/filter-kit/catalog` | Catalogue filtres |
| POST | `/v1/cloud/filter-kit/download-token` | Jeton téléchargement binaire |
| POST | `/v1/cloud/filter-kit/session` | Session filtre |
| POST | `/v1/cloud/filter-kit/usage` | Usage (async persist) |

## Activation admin

1. `POST /v1/admin/filter-kit/clients/:tenantId/enable`
2. `PATCH /v1/admin/filter-kit/clients/:tenantId/access` — quotas Premium

## Exemple bootstrap

```bash
curl -sS -H "X-Api-Key: gfk_YOUR_KEY" \
  "https://api.noverfly.com/v1/cloud/filter-kit/sdk/bootstrap?appId=my-app"
```

## Déploiement

- Migration : `20260522181500_filterkit_cloud`
- Seed catalogue : `npm run db:seed`
- Env : `FILTERKIT_CDN_BASE_URL`, `FILTERKIT_HMAC_SECRET`, `PUBLIC_HTTP_API_ORIGIN`

## Engines

Voir détails moteurs : `docs/filter-kit-engines.md`  
Flow test : `docs/filter-kit-test-flow.md`

## Note architecture

Le cloud **ne traite pas** la caméra en direct — les SDK (Banuba, DeepAR, Snap, MediaPipe) tournent dans l'app cliente.
