# 🚀 Guide d'Utilisation - Page de Détails des Ressources

## 📋 Vue d'ensemble

La page de détails des ressources a été complètement refondée selon vos spécifications. Voici comment utiliser les nouvelles fonctionnalités.

## 🔧 Composants Modifiés

### 1. ResourceCard.tsx
**Changement principal:** Bouton "Télécharger" → "Acheter"

```tsx
// Avant
<Button onClick={onDownload}>
  <Download className="h-4 w-4 mr-2" />
  Télécharger
</Button>

// Maintenant
<Button 
  onClick={onClick} // Ouvre la modal
  className="bg-[#F86E19] hover:bg-[#E55A00] text-white"
>
  <ShoppingCart className="h-4 w-4 mr-2" />
  Acheter
</Button>
```

### 2. ResourceModal.tsx
**Refonte complète** avec toutes les sections demandées.

## 🎯 Utilisation

### Pour afficher une ressource:
```tsx
import ResourceModal from '@/components/resources/ResourceModal';
import { ResourceWithStats } from '@/types/resources';

const MyComponent = () => {
  const [selectedResource, setSelectedResource] = useState<ResourceWithStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <>
      <ResourceCard
        resource={resource}
        onClick={() => {
          setSelectedResource(resource);
          setIsModalOpen(true);
        }}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
        onDownload={() => {}} // Pas utilisé maintenant
        isFavorite={isFavorite}
      />

      <ResourceModal
        resource={selectedResource}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
        isFavorite={isFavorite}
      />
    </>
  );
};
```

## 💳 Système de Crédits

Le modal utilise automatiquement le hook `useCredits()` pour gérer les achats:

```tsx
// Dans ResourceModal.tsx
const { consumeCredits, totalRemaining } = useCredits();

const handlePurchase = async () => {
  if (totalRemaining < resource.price) {
    toast.error("Crédits insuffisants");
    return;
  }
  
  const result = await consumeCredits(resource.price);
  if (result.success) {
    // Téléchargement automatique
    handleDownload();
  }
};
```

## 📊 Structure des Données

### Nouvelles colonnes requises en base de données:

```sql
-- Images supplémentaires
image_2_url, image_3_url, image_4_url, video_url

-- Description étendue
detailed_description

-- FAQ (3 questions/réponses)
faq_question_1, faq_answer_1, faq_question_2, faq_answer_2, faq_question_3, faq_answer_3

-- Raisons de choisir (3 titres/textes)
reason_1_title, reason_1_text, reason_2_title, reason_2_text, reason_3_title, reason_3_text

-- Items inclus (JSONB)
included_items: [{"emoji": "✅", "text": "Description"}]
```

### Format des données included_items:
```json
[
  {"emoji": "📄", "text": "Template Business Plan (35 pages)"},
  {"emoji": "📊", "text": "Modèles Excel inclus"},
  {"emoji": "🎯", "text": "Guide de rédaction"},
  {"emoji": "💡", "text": "3 exemples concrets"},
  {"emoji": "🎨", "text": "Pack graphiques"},
  {"emoji": "📞", "text": "Support 30 jours"}
]
```

## 🎨 Sections du Modal

### 1. Header (2 colonnes)
- **Gauche:** Image carrée avec bouton favori en overlay
- **Droite:** Infos complètes (titre, étoiles, badges, stats, description, prix + bouton acheter)

### 2. Section "Pourquoi choisir" (optionnelle)
- Affichée si `reason_1_title`, `reason_2_title`, ou `reason_3_title` existent
- Background dégradé vert
- 3 containers en grid responsive

### 3. Section "Inclus dans la template" (optionnelle)
- Affichée si `included_items` existe et n'est pas vide
- Liste en grid 2 colonnes avec emojis
- Fallback sur données par défaut si nécessaire

### 4. Section Avis
- Toujours affichée
- Bouton "Ajouter un avis" ouvre le formulaire
- Liste des avis existants avec ResourceRatingsList

### 5. Section FAQ (optionnelle)
- Affichée si au moins une FAQ existe
- Accordéons avec animations de rotation
- Max 3 questions/réponses

## 🔧 Personnalisation

### Couleurs
```css
/* Couleur principale */
--primary-orange: #F86E19;
--primary-orange-hover: #E55A00;

/* Dégradé section "Pourquoi choisir" */
background: linear-gradient(to bottom right, #ecfdf5, #f0fdfa);
```

### Responsive
- **Desktop:** Modal 80% largeur, grid 3 colonnes
- **Mobile:** Modal 95% largeur, grid 1 colonne
- **Breakpoint:** 768px

## 🧪 Tests

### Pour tester l'implémentation:
1. Utilisez le fichier `test/ResourceTestPage.tsx`
2. Vérifiez que tous les éléments s'affichent
3. Testez le responsive design
4. Validez les interactions (accordéons, formulaires, achat)

### Checklist de validation:
- [ ] Bouton "Acheter" sur ResourceCard
- [ ] Modal s'ouvre avec layout 2 colonnes
- [ ] Section "Pourquoi choisir" avec dégradé vert
- [ ] Section "Inclus" avec emojis
- [ ] Accordéons FAQ fonctionnels
- [ ] Formulaire d'avis fonctionnel
- [ ] Système de crédits fonctionne
- [ ] Design responsive
- [ ] Toasts d'erreur/succès

## 🚨 Troubleshooting

### Erreur "Crédits insuffisants"
Vérifiez que l'utilisateur a assez de crédits avec `useCredits()`:
```tsx
const { totalRemaining } = useCredits();
console.log('Crédits disponibles:', totalRemaining);
```

### Modal ne s'ouvre pas
Vérifiez que `isOpen` et `onClose` sont bien gérés:
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);
// ...
onClose={() => setIsModalOpen(false)}
```

### Données manquantes
Utilisez les fallbacks intégrés ou ajoutez des données par défaut:
```tsx
// Le modal gère automatiquement les données manquantes
// Les sections optionnelles ne s'affichent que si les données existent
```

## 📚 Documentation Supplémentaire

- **Types TypeScript:** `src/types/resources.ts`
- **Hooks:** `src/hooks/useResourceRatings.ts`, `src/hooks/useCreditsSimple.tsx`
- **Styles CSS:** `src/index.css` (classe `.resource-modal-content`)
- **Base de données:** `database/update_resources_table.sql`

## 🎉 Conclusion

Votre page de détails des ressources est maintenant entièrement conforme à vos spécifications avec :
- ✅ Bouton "Acheter" avec système de crédits
- ✅ Modal redesigné avec toutes les sections
- ✅ Système d'avis complet
- ✅ FAQ interactive
- ✅ Design responsive et moderne

Tous les composants sont modulaires, testables et prêts pour la production !