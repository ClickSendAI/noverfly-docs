# AI Cloud Service — DevAPI

Service cloud autonome 24h/24 pour IA, règles, bases de données connectées, stockage, automatisation et secret vault.

Base URL : `https://api.noverfly.com`

## Authentification

Deux modes :

| Mode | Header | Usage |
|------|--------|-------|
| GFK | `X-Api-Key: gfk_...` ou `Authorization: Bearer gfk_...` | Activation compte, onboarding scripts |
| Dashboard / app | JWT + headers AI (`x-gfk-key`, tenant context) | Configuration tenant, règles, génération |

## Activation (self-service GFK)

```bash
curl "https://api.noverfly.com/v1/cloud/ai/account/status" \
  -H "X-Api-Key: gfk_YOUR_KEY"

curl -X POST "https://api.noverfly.com/v1/cloud/ai/account/activate" \
  -H "X-Api-Key: gfk_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "appId": "my-app", "displayName": "Mon app AI" }'
```

Alias rétrocompat : `POST /v1/cloud/ai/activate`

## Groupes d'endpoints

### Compte et config tenant

- `GET/POST/PATCH/DELETE /v1/cloud/ai/tenant/config?appId=...`

### Clés providers (OpenAI, Gemini, etc.)

- `POST /v1/cloud/ai/keys/save`
- `POST /v1/cloud/ai/keys/test`
- `GET /v1/cloud/ai/keys/status?appId=...`

### Bases de données connectées

- `POST /v1/cloud/ai/databases/connect`
- `POST /v1/cloud/ai/databases/query`
- `GET /v1/cloud/ai/databases/list?appId=...`

### Stockage connecté

- `POST /v1/cloud/ai/storage/connect`
- `GET /v1/cloud/ai/storage/status?appId=...`

### Règles et automatisation

- `POST /v1/cloud/ai/rules/create`
- `GET /v1/cloud/ai/rules/list?appId=...`
- `POST /v1/cloud/ai/automation/message` — message entrant 24h/24
- `GET /v1/cloud/ai/automation/status?appId=...`

### Génération

- `POST /v1/cloud/ai/generate/text`
- `POST /v1/cloud/ai/generate/image`

### Secret Vault (par owner)

- `POST /v1/cloud/ai/owners/:aiOwnerType/:aiOwnerId/secrets/save`
- `GET /v1/cloud/ai/owners/:aiOwnerType/:aiOwnerId/secrets/list`
- `POST /v1/cloud/ai/secrets/save` — auto-résolu GFK + appId

### AI Clients (chat centralisé)

- `POST /v1/cloud/ai/clients/create`
- `POST /v1/cloud/ai/clients/:id/chat`

### WebSocket

Gateway temps réel enregistré sur le serveur (`registerAiWebSocketGateway`).

## Exemple génération texte

```bash
curl -X POST "https://api.noverfly.com/v1/cloud/ai/generate/text" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "my-app",
    "prompt": "Résume ce produit en 2 phrases",
    "model": "gemini-2.0-flash"
  }'
```

## Migrations associées

- `20260522190000_ai_cloud_service`
- `20260522200000_ai_conversation_owner`
- `20260522210000_ai_membership_role`
- `20260522220000_ai_owner_secret_vault`

## Worker background

Queue BullMQ `ai-cloud` — voir [migrations-and-jobs.md](./migrations-and-jobs.md)
