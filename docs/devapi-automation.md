# NoverFly DevAPI Automation Cloud

`NoverFly DevAPI Automation Cloud` est une couche de `Backend Logic as a Service`.

Le developpeur n'heberge pas un serveur `Node.js` complet.
Il declare des `workflows`, des `fonctions courtes`, des `triggers`, des `jobs`, des `branches`, des `validations`, des appels vers les services internes NoverFly et des traitements IA, tous executes dans un environnement controle.

## Positionnement produit

Ce produit n'est pas un hebergement brut.

Ce que le developpeur peut faire:

- automatiser un tunnel marketing
- qualifier des leads
- stocker des donnees dans les collections NoverFly
- envoyer des emails transactionnels ou marketing
- envoyer des notifications
- creer ou alimenter des conversations messenger
- appeler une autre fonction cloud
- declencher de l'IA
- creer des factures
- planifier des rappels et des suivis

Ce que le developpeur ne peut pas faire:

- lancer `app.listen(3000)`
- ouvrir un port
- executer un serveur permanent
- installer librement des dependances
- acceder librement au systeme
- faire du scraping massif
- lancer des workers infinis
- contourner les quotas CPU, RAM, duree et logs

## Authentification et securite

- Cle secrete `gfk_` obligatoire
- `Authorization: Bearer gfk_xxxxx` supporte
- `X-Api-Key` et `X-GFK-Key` acceptes
- Plan minimum: `20 USD/mois`
- Mode `test` et `live`
- Signature `X-NoverFly-Signature` obligatoire en `live` sur `POST /v1/devapi/events`
- `Idempotency-Key` obligatoire en `live` sur `POST /v1/devapi/events`
- Reutiliser la meme `Idempotency-Key` avec un payload different est refuse
- Quotas mensuels controles
- Fonctions isolees et limitees

## Endpoints

- `POST /v1/devapi/events`
- `POST /v1/devapi/workflows`
- `GET /v1/devapi/workflows`
- `GET /v1/devapi/workflows/:id`
- `PATCH /v1/devapi/workflows/:id`
- `DELETE /v1/devapi/workflows/:id`
- `POST /v1/devapi/functions`
- `POST /v1/devapi/functions/:id/run`
- `GET /v1/devapi/functions`
- `PATCH /v1/devapi/functions/:id`
- `DELETE /v1/devapi/functions/:id`
- `POST /v1/devapi/jobs`
- `GET /v1/devapi/jobs`
- `GET /v1/devapi/jobs/:id`
- `DELETE /v1/devapi/jobs/:id`
- `GET /v1/devapi/logs`
- `GET /v1/devapi/usage`
- `GET /v1/devapi/quota`
- `POST /v1/devapi/webhooks`

## Services internes accessibles

Le moteur DevAPI peut piloter les services internes NoverFly suivants.

### Directement dans un workflow

- `validate_data`
- `validate_file`
- `branch`
- `send_notification`
- `notify_admin`
- `send_email`
- `send_marketing_email`
- `ai_generate_text`
- `ai_document_extract`
- `ai_document_check`
- `create_invoice`
- `execute_function`
- `schedule_action`
- `create_collection`
- `create_collection_record`
- `list_collection_records`
- `get_collection_record`
- `update_collection_record`
- `delete_collection_record`
- `create_conversation`
- `send_message`

### Depuis une fonction Node.js controlee

Les fonctions `Node.js` ont acces a `ctx.services` et `ctx.noverfly`.

Services exposes:

- `ctx.services.collections`
- `ctx.services.notifications`
- `ctx.services.email`
- `ctx.services.ai`
- `ctx.services.messenger`
- `ctx.services.functions`
- `ctx.services.invoices`

Les fonctions `Python` restent des workers de calcul et de transformation.
Pour appeler les services internes NoverFly depuis Python, il faut passer par un workflow DevAPI autour de la fonction.

## Mode de composition entre actions

Chaque etape peut sauvegarder son resultat dans `state` via `saveAs`.

Exemple:

```json
{
  "type": "create_collection_record",
  "collection": "marketing-leads",
  "data": {
    "email": "{{input.lead.email}}",
    "source": "{{input.lead.source}}"
  },
  "saveAs": "leadRecord"
}
```

L'etape suivante peut reutiliser:

- `{{state.leadRecord.id}}`
- `{{state.leadRecord.slug}}`
- `{{state.leadRecord.data.email}}`

Cela permet de faire de vrais appels de logique entre:

- validation
- stockage
- scoring
- email
- notification
- messagerie
- IA
- fonctions cloud

## Exemples concrets d'automatisation

### 1. Lead marketing capture + email + notification + relance

```json
{
  "name": "Lead marketing funnel",
  "status": "active",
  "mode": "live",
  "trigger": {
    "type": "lead_created",
    "event": "lead_created"
  },
  "actions": [
    {
      "type": "validate_data",
      "rules": {
        "lead.email": "required|email",
        "lead.name": "required|min:2"
      },
      "saveAs": "leadValidation"
    },
    {
      "type": "create_collection_record",
      "collection": "marketing-leads",
      "data": {
        "name": "{{input.lead.name}}",
        "email": "{{input.lead.email}}",
        "phone": "{{input.lead.phone}}",
        "source": "{{input.lead.source}}",
        "campaign": "{{input.lead.campaign}}"
      },
      "status": "PUBLISHED",
      "saveAs": "leadRecord"
    },
    {
      "type": "ai_generate_text",
      "prompt": "Score this lead and return a short French summary. Lead: {{input.lead.email}} Source: {{input.lead.source}} Campaign: {{input.lead.campaign}}",
      "saveAs": "leadScore"
    },
    {
      "type": "send_marketing_email",
      "to": "{{input.lead.email}}",
      "subject": "Bienvenue {{input.lead.name}}",
      "html": "<h1>Bienvenue</h1><p>Merci pour votre interet.</p>"
    },
    {
      "type": "notify_admin",
      "title": "Nouveau lead",
      "message": "Lead enregistre: {{state.leadRecord.data.email}}"
    },
    {
      "type": "schedule_action",
      "delay": "3_days",
      "action": {
        "type": "send_marketing_email",
        "to": "{{input.lead.email}}",
        "subject": "Relance campagne",
        "html": "<p>Nous revenons vers vous.</p>"
      }
    }
  ]
}
```

### 2. Publicite / campagne / CRM dans les collections NoverFly

Les collections peuvent servir de mini CRM ou de base marketing:

- `marketing-leads`
- `campaigns`
- `ad-creatives`
- `email-sequences`
- `audience-segments`
- `sales-followups`

Quand une automation cree, modifie ou supprime un record de collection via DevAPI:

- les donnees restent dans NoverFly
- les bindings de logique du site sont notifies
- les autres modules internes peuvent reutiliser la meme source de donnees

Exemple d'etape:

```json
{
  "type": "create_collection_record",
  "collection": "ad-creatives",
  "data": {
    "campaign_name": "{{input.campaign.name}}",
    "channel": "{{input.campaign.channel}}",
    "headline": "{{input.creative.headline}}",
    "cta": "{{input.creative.cta}}"
  },
  "status": "DRAFT",
  "saveAs": "creativeDraft"
}
```

### 3. Message automatique dans la messagerie NoverFly

```json
{
  "type": "create_conversation",
  "userIdA": "{{input.sellerUserId}}",
  "userIdB": "{{input.clientUserId}}",
  "saveAs": "conversation"
}
```

```json
{
  "type": "send_message",
  "conversationId": "{{state.conversation.id}}",
  "senderId": "{{input.sellerUserId}}",
  "messageType": "TEXT",
  "content": "Bonjour {{input.clientName}}, votre commande est bien prise en charge.",
  "clientMessageId": "order-{{input.orderId}}-welcome"
}
```

### 4. Appel de fonction a fonction

```json
{
  "type": "execute_function",
  "functionName": "score_marketing_lead",
  "input": {
    "email": "{{input.lead.email}}",
    "source": "{{input.lead.source}}"
  },
  "saveAs": "leadScoreResult"
}
```

Puis:

```json
{
  "type": "branch",
  "condition": {
    "field": "state.leadScoreResult.result.score",
    "operator": ">=",
    "value": 80
  },
  "ifTrue": [
    {
      "type": "send_marketing_email",
      "to": "{{input.lead.email}}",
      "subject": "Offre VIP",
      "html": "<p>Vous etes eligible a une offre premium.</p>"
    }
  ],
  "ifFalse": [
    {
      "type": "send_marketing_email",
      "to": "{{input.lead.email}}",
      "subject": "Decouvrez notre offre",
      "html": "<p>Voici une premiere offre pour vous.</p>"
    }
  ]
}
```

## Fonctions Node.js avec `ctx.services`

Exemple complet:

```ts
export default async function handler(ctx) {
  const lead = await ctx.services.collections.createRecord({
    collection: 'marketing-leads',
    data: {
      name: ctx.input.name,
      email: ctx.input.email,
      source: ctx.input.source
    },
    status: 'PUBLISHED'
  });

  const score = await ctx.services.ai.generateText({
    prompt: `Score this lead in French: ${ctx.input.email} from ${ctx.input.source}`
  });

  await ctx.services.email.sendMarketing({
    to: ctx.input.email,
    subject: 'Bienvenue',
    html: '<p>Votre demande a ete recue.</p>'
  });

  await ctx.services.notifications.send({
    to: 'admin',
    title: 'Nouveau lead marketing',
    message: `Lead ${ctx.input.email} enregistre`
  });

  return {
    leadId: lead.id,
    score
  };
}
```

### Services Node.js disponibles

#### `ctx.services.collections`

- `createCollection({ name, slug?, description?, fields, settings? })`
- `updateCollection({ collection, ... })`
- `createRecord({ collection, data, status?, slug?, scheduledAt? })`
- `listRecords({ collection, status?, page?, perPage?, sortBy?, sortDir?, search? })`
- `getRecord({ collection, recordId | recordSlug | record })`
- `updateRecord({ collection, recordId | recordSlug | record, data?, status?, slug? })`
- `deleteRecord({ collection, recordId | recordSlug | record })`

#### `ctx.services.email`

- `send({ to, subject, html?, text?, message?, template?, senderProfile? })`
- `sendMarketing({ to, subject, html?, text?, message?, template?, senderProfile? })`

#### `ctx.services.notifications`

- `send({ to, title, message, link?, push?, meta? })`

`to` peut viser:

- `admin`
- `seller`
- `buyer`
- `user:USER_ID`
- `siteuser:SITE_USER_ID`

#### `ctx.services.ai`

- `generateText({ prompt })`

#### `ctx.services.messenger`

- `createDirectConversation({ userIdA, userIdB })`
- `sendMessage({ conversationId, senderId, content, messageType?, replyToId?, clientMessageId? })`

#### `ctx.services.functions`

- `run({ functionId, input })`
- `run({ functionName, input })`

Une fonction ne peut pas s'auto-appeler via `ctx.services.functions.run()`.

#### `ctx.services.invoices`

- `create({ amount, currency?, description?, quantity? })`

## Fonctions Python

Les fonctions Python sont faites pour:

- validation
- calcul
- transformation
- scoring
- formatage

Elles n'exposent pas encore `ctx.services`.

Si un developpeur veut:

- calculer en Python
- puis envoyer un email
- puis ecrire dans une collection

il faut:

1. lancer la fonction Python avec `execute_function`
2. sauvegarder le resultat avec `saveAs`
3. utiliser les etapes workflow suivantes

## Comment appeler NoverFly depuis le SDK

### TypeScript

```ts
import { NoverflySDK } from '../src/sdk/gloowflix-sdk';

const noverfly = new NoverflySDK({
  baseUrl: 'https://api.noverfly.com',
  secretKey: 'gfk_xxxxx',
  projectId: 'your-site-uuid',
  mode: 'live',
});

await noverfly.automation.trigger('order_paid', {
  orderId: 'ord_001',
  amount: 50,
  currency: 'USD',
  client: {
    name: 'Patrick',
    email: 'patrick@example.com'
  }
});
```

### Python

```python
from gloowflix_sdk import NoverflySDK

noverfly = NoverflySDK(
    base_url="https://api.noverfly.com",
    secret_key="gfk_xxxxx",
    project_id="your-site-uuid",
    mode="live",
)

noverfly.trigger("lead_created", {
    "lead": {
        "name": "Patrick",
        "email": "patrick@example.com",
        "source": "facebook_ads"
    }
})
```

## Cas d'usage recommandés

- marketing automation
- abandoned cart
- lead nurturing
- onboarding client
- relance commerciale
- scoring de prospects
- validation KYC / documents
- suivi vendeur
- CRM leger base sur collections
- workflows IA
- support client automatise
- post-achat et demandes d'avis

## Plans

### Developer - 20 USD+

- acces DevAPI
- workflows controles
- fonctions cloud courtes
- notifications
- email de base
- IA limitee
- webhooks
- jobs planifies

### Pro - 49 USD+

- plus de quotas
- IA plus riche
- plus de branches
- plus de fonctions
- plus de logs

### Business - 99 USD+

- quotas eleves
- priorite queue
- fonctions plus longues
- monitoring avance
- automatisation documentaire plus riche

## Bonnes pratiques

- utiliser les workflows pour l'orchestration
- utiliser les fonctions pour le calcul court
- stocker les donnees metier dans les collections
- utiliser `saveAs` pour chainer proprement les etapes
- preferer `execute_function` plutot qu'un gros code monolithique
- garder les fonctions courtes, stateless et predictibles
- utiliser `test` avant `live`
- signer les evenements `live`

## Limites actuelles

- pas de backend libre
- pas de port ouvert
- pas de service bridge Python
- pas d'installation libre de packages
- pas d'acces systeme
- pas d'acces reseau illimite

## Resume produit

`NoverFly DevAPI Automation Cloud` permet aux developpeurs de construire de vraies logiques cloud professionnelles:

- automatisations marketing
- fonctions cloud courtes
- stockage dans les collections
- appels a l'IA
- notifications
- emails
- messagerie
- facturation
- branches et validations

Le tout sans heberger un backend complet et sans sortir du cadre securise de NoverFly.
