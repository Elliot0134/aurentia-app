# Voice Input Feature - Documentation

## Vue d'ensemble

Le système de saisie vocale permet aux utilisateurs d'enregistrer leur voix directement dans l'application et de transcrire automatiquement l'audio en texte via n8n et Whisper AI.

## Architecture

```
User clicks Mic Button
        ↓
MediaRecorder API (browser)
        ↓
Audio Blob (MP3/WebM)
        ↓
Upload to Supabase Storage
        ↓
Create record in 'audio' table
        ↓
Send to n8n webhook
        ↓
n8n → Whisper API (transcription)
        ↓
Return transcribed text
        ↓
Update audio record + inject text into form field
```

## Composants créés

### 1. Migration Supabase
**Fichier**: `supabase/migrations/20251030000000_create_audio_storage_system.sql`

Créé:
- Bucket `audio-recordings` pour stocker les fichiers audio
- Table `audio` pour les métadonnées
- Policies RLS pour la sécurité
- Fonction de cleanup automatique (30 jours)

### 2. Service Audio
**Fichier**: `src/services/audioService.ts`

Fonctions principales:
- `uploadAudioToStorage()` - Upload l'audio vers Supabase
- `createAudioRecord()` - Crée l'enregistrement en base
- `transcribeAudioWithN8n()` - Envoie à n8n pour transcription
- `recordAndTranscribeAudio()` - Fonction principale qui orchestre tout
- `deleteAudioRecording()` - Supprime audio + métadonnées
- `getUserAudioRecordings()` - Récupère l'historique

### 3. Hook React
**Fichier**: `src/hooks/useSpeechToText.ts`

Hook personnalisé `useSpeechToText()`:
```typescript
const {
  recordingState,      // 'idle' | 'recording' | 'processing' | 'error'
  isRecording,         // boolean
  isProcessing,        // boolean
  duration,            // seconds
  transcribedText,     // string | null
  startRecording,      // () => Promise<void>
  stopRecording,       // () => Promise<void>
  cancelRecording,     // () => void
  error,               // Error | null
} = useSpeechToText({
  onTranscriptionComplete: (text) => console.log(text),
  onError: (error) => console.error(error),
  maxDurationSeconds: 120,
  projectId: 'optional-project-id',
});
```

### 4. Composant UI
**Fichier**: `src/components/ui/voice-input-button.tsx`

Deux composants exportés:

#### VoiceInputButton
Bouton micro standalone avec animations:
```tsx
<VoiceInputButton
  onTranscript={(text) => handleText(text)}
  size="icon"
  variant="ghost"
  projectId={currentProjectId}
  maxDurationSeconds={120}
  showDuration={true}
/>
```

#### VoiceInputFieldButton
Version pour intégration avec input/textarea:
```tsx
const inputRef = useRef<HTMLTextAreaElement>(null);

<VoiceInputFieldButton
  inputRef={inputRef}
  appendText={true} // Ajoute au texte existant
  projectId={projectId}
/>
```

## Configuration n8n

### Webhook attendu
**URL**: `https://n8n.srv906204.hstgr.cloud/webhook/audio-to-text`

### Input attendu
Le webhook reçoit un `FormData` avec:
- `data` (Blob) : Le fichier audio MP3/WebM
- `audioId` (string) : ID de l'enregistrement dans la table `audio`

### Output attendu
Le webhook doit retourner un JSON:
```json
{
  "text": "Texte transcrit par Whisper",
  "transcription": "Texte transcrit par Whisper" // ou
}
```

### Configuration n8n recommandée
1. **Webhook Node** : Reçoit le FormData
2. **Extract Binary Data** : Extrait le fichier audio
3. **OpenAI Whisper Node** :
   - Model: `whisper-1`
   - Language: `fr` (français)
   - Input: Binary data from webhook
4. **Set Node** : Formate la réponse
   - `text` = `{{ $json.text }}`
5. **Respond to Webhook** : Retourne le JSON

## Utilisation dans les formulaires

### Exemple 1 : Textarea avec bouton micro

```tsx
import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInputFieldButton } from '@/components/ui/voice-input-button';

function MyFormStep({ data, onChange }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="space-y-2">
      <label htmlFor="description">Description du projet</label>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          id="description"
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Décrivez votre projet..."
          rows={5}
        />
        <div className="absolute bottom-2 right-2">
          <VoiceInputFieldButton
            inputRef={textareaRef}
            appendText={false}
            size="sm"
            variant="ghost"
          />
        </div>
      </div>
    </div>
  );
}
```

### Exemple 2 : Input avec bouton inline

```tsx
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { VoiceInputFieldButton } from '@/components/ui/voice-input-button';

function ProjectNameInput({ value, onChange }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-2 items-center">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nom du projet"
        className="flex-1"
      />
      <VoiceInputFieldButton
        inputRef={inputRef}
        size="icon"
        variant="outline"
      />
    </div>
  );
}
```

### Exemple 3 : Hook direct (contrôle manuel)

```tsx
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { Button } from '@/components/ui/button';

function CustomVoiceForm() {
  const {
    isRecording,
    isProcessing,
    duration,
    transcribedText,
    startRecording,
    stopRecording,
  } = useSpeechToText({
    onTranscriptionComplete: (text) => {
      console.log('Transcription:', text);
      // Do something with the text
    },
    maxDurationSeconds: 60,
  });

  return (
    <div>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isRecording ? `Arrêter (${duration}s)` : 'Démarrer'}
      </Button>
      {transcribedText && <p>Texte: {transcribedText}</p>}
    </div>
  );
}
```

## Intégration dans CreateProjectFlow

Pour ajouter le bouton micro aux différents steps, modifiez les fichiers dans `src/components/project/slides/`:

### Exemple: StepBasicInfo.tsx

```tsx
import { useRef } from 'react';
import { VoiceInputFieldButton } from '@/components/ui/voice-input-button';

// Dans le return, pour le champ projectIdeaSentence:
const projectIdeaRef = useRef<HTMLTextAreaElement>(null);

<div className="relative">
  <Textarea
    ref={projectIdeaRef}
    value={data.projectIdeaSentence || ''}
    onChange={(e) => onChange('projectIdeaSentence', e.target.value)}
    placeholder="Décrivez votre idée en quelques phrases..."
    rows={4}
  />
  <div className="absolute bottom-3 right-3">
    <VoiceInputFieldButton
      inputRef={projectIdeaRef}
      appendText={false}
      size="sm"
      variant="ghost"
    />
  </div>
</div>
```

## Animations et états visuels

Le composant `VoiceInputButton` inclut plusieurs animations:

1. **Idle** : Icône micro normale
2. **Recording** :
   - Animation pulse sur le bouton
   - Point rouge clignotant en haut à droite
   - Compteur de durée (si showDuration=true)
   - Couleur rouge
3. **Processing** :
   - Spinner animé
   - Texte "Transcription..."
   - Bouton désactivé
4. **Error** :
   - Toast notification avec message d'erreur

## Gestion des permissions

Le hook demande automatiquement la permission microphone:
```javascript
await navigator.mediaDevices.getUserMedia({ audio: true })
```

Erreurs gérées:
- `NotAllowedError` : Permission refusée
- `NotFoundError` : Pas de microphone détecté
- Erreurs réseau n8n
- Erreurs Supabase

## Sécurité et RLS

Les policies Supabase garantissent:
- Users ne peuvent voir que leurs propres enregistrements
- Upload limité à leurs propres dossiers (`user_id/filename.mp3`)
- Organization staff peut voir les enregistrements des membres
- Taille max: 10 MB par fichier
- Formats acceptés: MP3, WebM, WAV, OGG, M4A

## Nettoyage et maintenance

### Fonction de cleanup automatique
```sql
SELECT cleanup_old_audio_recordings();
```
Supprime les enregistrements > 30 jours.

À configurer en cron job Supabase (optionnel):
```sql
SELECT cron.schedule(
  'cleanup-old-audio',
  '0 2 * * *', -- 2am chaque jour
  $$SELECT cleanup_old_audio_recordings()$$
);
```

## Coûts estimés

### OpenAI Whisper API
- **Tarif** : 0.006$/minute
- **Exemple** : 1000 enregistrements de 1 minute = 6$

### Supabase Storage
- **Gratuit** : 1 GB inclus
- **Après** : ~0.021$/GB/mois
- **Exemple** : 1000 enregistrements MP3 (1 min chacun ~1MB) = ~1GB = gratuit

## Troubleshooting

### L'enregistrement ne démarre pas
- Vérifier les permissions microphone du navigateur
- Tester si `navigator.mediaDevices` est disponible (HTTPS requis)

### La transcription échoue
- Vérifier que le webhook n8n est accessible
- Vérifier la réponse n8n (format JSON correct)
- Vérifier les logs dans la table `audio` (champ `error_message`)

### L'audio n'est pas sauvegardé
- Vérifier les RLS policies Supabase
- Vérifier que le user est authentifié
- Vérifier les logs console pour erreurs Storage

## Tests recommandés

1. **Enregistrement court** (5s) : Doit transcrire rapidement
2. **Enregistrement long** (2 min) : Doit auto-stop
3. **Permission refusée** : Doit afficher message d'erreur
4. **Webhook offline** : Doit gérer l'erreur gracieusement
5. **Texte existant + appendText** : Doit concaténer correctement

## Évolutions futures possibles

- [ ] Support multilingue (détecter langue automatiquement)
- [ ] Visualisation d'onde audio pendant l'enregistrement
- [ ] Historique des transcriptions accessibles
- [ ] Pause/Resume de l'enregistrement
- [ ] Export des enregistrements audio
- [ ] Correction manuelle de la transcription
- [ ] Dictée continue (streaming real-time)
