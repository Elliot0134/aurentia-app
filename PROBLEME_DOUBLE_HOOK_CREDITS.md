# 🚨 PROBLÈME IDENTIFIÉ : Double Hook useCredits

## Le Problème

Vous avez **2 fichiers useCredits** qui entrent en conflit :

### **1. Ancien Hook (useCredits.js) - ❌ OBSOLÈTE**
```javascript
// src/hooks/useCredits.js - LIGNE 4
const [credits, setCredits] = useState(100); // ⚠️ Crédits hardcodés !
```

### **2. Nouveau Hook (useCredits.tsx) - ✅ CORRECT**  
```typescript
// src/hooks/useCredits.tsx - LIGNE 31
const { data, error: rpcError } = await supabase
  .rpc('billing.get_user_balance', { p_user_id: session.user.id });
```

## Le "3 sur 5" que vous voyez

Le composant `CreditBalance.jsx` utilise probablement l'**ancien hook** qui affiche des crédits hardcodés ou lit depuis l'ancienne table `profiles`.

## Solutions

### **1. URGENT : Supprimer l'ancien hook**
```bash
rm src/hooks/useCredits.js
```

### **2. Vérifier les imports**
Tous les composants doivent utiliser :
```typescript
import { useCredits } from '../hooks/useCredits.tsx';
```

### **3. Chercher "3 sur 5" dans le code**
Il faut trouver d'où vient cet affichage et le corriger.

## Actions Immédiates

1. Supprimer `useCredits.js` 
2. Corriger tous les imports vers `useCredits.tsx`
3. Supprimer les colonnes obsolètes dans `profiles` (credits_restants, credits_limite)