# Configuration du Webhook n8n pour Speech-to-Text

## URL du Webhook
```
https://n8n.srv906204.hstgr.cloud/webhook/audio-to-text
```

## Configuration n8n - Étape par étape

### 1. Créer un nouveau workflow n8n

Nom suggéré : `Audio to Text - Whisper Transcription`

### 2. Node 1 : Webhook (Trigger)

**Configuration** :
- Path : `/webhook/audio-to-text`
- Method : `POST`
- Authentication : None (ou selon vos besoins)
- Response Mode : `When Last Node Finishes`

**Ce que vous recevrez** :
```javascript
{
  data: {
    data: <Binary Audio File>,  // Le fichier audio MP3/WebM
    audioId: "uuid-string"       // ID de l'enregistrement dans la DB
  }
}
```

### 3. Node 2 : Set (Préparation)

**Purpose** : Extraire l'audioId pour la réponse

**Configuration** :
- Mode : Manual Mapping
- Mapping :
  ```
  audioId : {{ $json.audioId }}
  ```

### 4. Node 3 : Convert Binary to JSON (si nécessaire)

**Configuration** :
- Mode : Each item in input
- Convert : `data` property
- Options :
  - Mode: `Binary to JSON`
  - Source Property: `data`

### 5. Node 4 : OpenAI (Whisper)

**Configuration** :
- Resource : `Audio`
- Operation : `Transcribe`
- Input Data Field Name : `data`
- Model : `whisper-1`
- Language : `fr` (français)
- Response Format : `json`

**Note** : Assurez-vous d'avoir configuré vos credentials OpenAI dans n8n

### 6. Node 5 : Set (Formatage Réponse)

**Purpose** : Formatter la réponse pour l'app React

**Configuration** :
- Mode : Manual Mapping
- Mapping :
  ```json
  {
    "text": "={{ $json.text }}",
    "audioId": "={{ $('Set').item.json.audioId }}",
    "duration": "={{ $json.duration }}",
    "language": "={{ $json.language }}"
  }
  ```

### 7. Node 6 : Respond to Webhook

**Configuration** :
- Respond With : `JSON`
- Response Body :
  ```json
  {
    "text": "={{ $json.text }}",
    "audioId": "={{ $json.audioId }}"
  }
  ```
- Status Code : `200`

## Schéma du workflow

```
┌─────────────────┐
│  Webhook POST   │ ← Reçoit FormData avec audio
│  /audio-to-text │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Set audioId    │ ← Extrait audioId
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI Whisper │ ← Transcription audio → texte
│  (whisper-1)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Set Response   │ ← Formate la réponse JSON
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Respond Webhook │ ← Retourne { text, audioId }
└─────────────────┘
```

## JSON du workflow (à importer dans n8n)

```json
{
  "name": "Audio to Text - Whisper",
  "nodes": [
    {
      "parameters": {
        "path": "audio-to-text",
        "options": {},
        "responseMode": "lastNode"
      },
      "id": "webhook-node",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "audio-to-text"
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "audioId",
              "value": "={{ $json.audioId }}"
            }
          ]
        },
        "options": {}
      },
      "id": "set-audioid",
      "name": "Extract AudioId",
      "type": "n8n-nodes-base.set",
      "typeVersion": 2,
      "position": [460, 300]
    },
    {
      "parameters": {
        "resource": "audio",
        "operation": "transcribe",
        "binaryPropertyName": "data",
        "model": "whisper-1",
        "options": {
          "language": "fr",
          "responseFormat": "json"
        }
      },
      "id": "openai-whisper",
      "name": "OpenAI Whisper",
      "type": "n8n-nodes-base.openAi",
      "typeVersion": 1,
      "position": [680, 300],
      "credentials": {
        "openAiApi": {
          "id": "YOUR_OPENAI_CREDENTIAL_ID",
          "name": "OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "text",
              "value": "={{ $json.text }}"
            },
            {
              "name": "audioId",
              "value": "={{ $('Extract AudioId').item.json.audioId }}"
            }
          ]
        },
        "options": {}
      },
      "id": "format-response",
      "name": "Format Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 2,
      "position": [900, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { text: $json.text, audioId: $json.audioId } }}",
        "options": {
          "responseCode": 200
        }
      },
      "id": "respond-webhook",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1120, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Extract AudioId",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract AudioId": {
      "main": [
        [
          {
            "node": "OpenAI Whisper",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Whisper": {
      "main": [
        [
          {
            "node": "Format Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Format Response": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Test du webhook

### Avec curl (exemple)

```bash
curl -X POST https://n8n.srv906204.hstgr.cloud/webhook/audio-to-text \
  -F "data=@test-audio.mp3" \
  -F "audioId=test-123"
```

### Réponse attendue

```json
{
  "text": "Bonjour, ceci est un test de transcription audio.",
  "audioId": "test-123"
}
```

## Gestion des erreurs

### Node Error Handler (optionnel)

Ajoutez un node "On Error" pour capturer les erreurs :

```json
{
  "parameters": {
    "values": {
      "string": [
        {
          "name": "error",
          "value": "={{ $json.message }}"
        },
        {
          "name": "text",
          "value": ""
        }
      ]
    }
  },
  "name": "Error Handler",
  "type": "n8n-nodes-base.set",
  "typeVersion": 2,
  "position": [680, 480],
  "onError": "continueErrorOutput"
}
```

## Monitoring et logs

### Activer les logs dans n8n

Dans les settings du workflow :
- Save Execution Progress : `Yes`
- Save Execution Data : `Yes`
- Save Manual Executions : `Yes`

### Variables à logger

Pour le debugging, ajoutez un node "Set" après Whisper :

```javascript
{
  "audioId": "={{ $('Extract AudioId').item.json.audioId }}",
  "transcribedText": "={{ $json.text }}",
  "duration": "={{ $json.duration }}",
  "language": "={{ $json.language }}",
  "timestamp": "={{ $now }}"
}
```

## Limites et quotas OpenAI

### Whisper API Pricing
- **Cost** : $0.006 / minute
- **Max file size** : 25 MB
- **Supported formats** : mp3, mp4, mpeg, mpga, m4a, wav, webm

### Rate Limits (tier free)
- 3 requests per minute
- 200 requests per day

### Recommandations
- Limiter la durée d'enregistrement à 2 minutes max (déjà implémenté dans le hook React)
- Implémenter un rate limiting côté app si besoin
- Monitorer les coûts via OpenAI dashboard

## Sécurité

### Protection du webhook

1. **IP Whitelisting** (optionnel) :
   ```
   Autoriser uniquement les IPs de votre app
   ```

2. **API Key / Secret** (recommandé) :
   - Ajouter un header `X-API-Key` dans les requêtes
   - Vérifier dans n8n avec un node "IF"

3. **Rate Limiting** :
   - Implémenter dans n8n ou via proxy (Cloudflare, etc.)

### Exemple avec API Key

Ajoutez un node "IF" après le webhook :

```javascript
// Condition
{{ $json.headers['x-api-key'] === 'YOUR_SECRET_KEY' }}

// Si faux → Respond 401
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

## Optimisations futures

1. **Cache** : Stocker les transcriptions pour éviter de re-transcrire le même audio
2. **Compression** : Compresser l'audio avant envoi pour réduire la bande passante
3. **Streaming** : Implémenter transcription en temps réel avec Whisper streaming
4. **Multi-langue** : Détecter automatiquement la langue parlée
5. **Post-processing** : Corriger la ponctuation, capitalisation, etc.

## Troubleshooting

### Erreur "Binary data not found"
- Vérifier que le FormData envoie bien le champ `data`
- Vérifier le format MIME type (audio/mpeg, audio/webm)

### Erreur "Invalid audio file"
- Vérifier que l'audio n'est pas corrompu
- Essayer de convertir en MP3 côté client avant envoi

### Timeout
- Augmenter le timeout du webhook dans n8n settings
- Réduire la durée max d'enregistrement

### Transcription vide
- Vérifier que l'audio contient de la parole
- Tester avec un fichier audio connu

## Contact

Pour toute question sur la configuration n8n, contactez votre administrateur système.
