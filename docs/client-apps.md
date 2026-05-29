# Client Apps Android — Push & Appels

Enregistrement des applications Android natives (APK) pour push FCM data-only, appels entrants et sécurité GFK.

## Modèle

| Entité | Rôle |
|--------|------|
| `client_apps` | App Android enregistrée (packageName, firebaseProjectId, flags) |
| `gfk_keys` | Clé SECRET liée à l'app pour signature push |
| `push_tokens` | Token FCM par device / utilisateur |

Flags importants :

- `pushEnabled` — notifications chat
- `callsEnabled` — appels entrants FCM `call_invite`

## Enregistrer un device

```http
POST /api/client/register-device
Content-Type: application/json
Authorization: Bearer SITE_USER_JWT   (optionnel)

{
  "appId": "11111111-1111-1111-1111-111111111111",
  "gfkPublicKey": "gpk_public_xxxxxxxx",
  "packageName": "com.streewi.app",
  "deviceId": "android-device-uuid",
  "fcmToken": "fcm-token-from-firebase",
  "platform": "android",
  "userId": "optional-user-uuid",
  "siteUserId": "optional-site-user-uuid",
  "appVersion": "1.2.0",
  "locale": "fr-FR"
}
```

Réponse : `{ tokenId, clientAppId, ... }`

## Désenregistrer

```http
POST /api/client/unregister-device
{
  "appId": "...",
  "gfkPublicKey": "...",
  "packageName": "com.streewi.app",
  "fcmToken": "...",
  "platform": "android"
}
```

## Push appel entrant (cloud)

Le cloud envoie un FCM **100 % data-only** :

- `type: call_invite` — sonnerie gérée côté APK
- `type: call_cancel` — expiration / annulation

Voir [push-fcm-cloud.md](./push-fcm-cloud.md) pour `call_invite` / `call_cancel` (payload data-only FCM).

## Test DevAPI

```http
POST /api/dev/test-incoming-call-push
X-API-Key: gfk_YOUR_KEY

{
  "calleeUserId": "uuid",
  "callerName": "Test Appel",
  "callMode": "audio",
  "dryRun": true
}
```

## Validation côté cloud

Avant envoi push :

- `clientApp.status === ACTIVE`
- `packageName` token = `clientApp.packageName`
- GFK SECRET actif et non expiré
- `firebaseProjectId` aligné avec config tenant FCM

## Migration SQL

`prisma/migrations/20260518110000_client_apps_incoming_call_push/migration.sql`

Manual fallback : `prisma/migrations_manual/20260518_client_apps_incoming_call_push.sql`
