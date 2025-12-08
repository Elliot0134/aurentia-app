# 📝 Slides de création de projet

Ce dossier contient les composants slides pour le flow de création de projet.

## Slides fournis (adaptés Next.js)

- ✅ `StepBasicInfo.tsx` - Étape 0: Nom + Description
- ✅ `StepRetranscription.tsx` - Étape 8: Retranscription IA (éditables)

## Slides à adapter depuis le projet original

Copiez ces fichiers depuis `src/components/project/slides/` et ajoutez `'use client';` en première ligne :

- `StepProductsServices.tsx` - Étape 1: Produits/Services
- `StepClientele.tsx` - Étape 2: Clientèle cible  
- `StepNeeds.tsx` - Étape 3: Besoins
- `StepTypeLocation.tsx` - Étape 4: Type + Localisation
- `StepTeam.tsx` - Étape 5: Équipe
- `StepAdditionalInfo.tsx` - Étape 6: Infos supplémentaires
- `StepConfirmation.tsx` - Étape 7: Récapitulatif

## Template de base pour un slide

```typescript
'use client';

import { ProjectCreationData } from '@/types/projectCreation';

interface StepXXXProps {
  data: ProjectCreationData;
  onChange: (field: keyof ProjectCreationData, value: any) => void;
}

const StepXXX = ({ data, onChange }: StepXXXProps) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Titre de l'étape
        </h2>
      </div>

      <div className="space-y-6">
        {/* Contenu du slide */}
      </div>
    </div>
  );
};

export default StepXXX;
```

## Modifications communes à faire

1. Ajouter `'use client';` en première ligne
2. Remplacer les imports `@/` par les bons chemins Next.js
3. Supprimer les imports de composants non utilisés (ex: VoiceInputFieldButton si pas implémenté)
4. Adapter les classes dark mode si nécessaire
