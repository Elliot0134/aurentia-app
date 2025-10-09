# 🧪 Tests de Correction - Boucle de Redirection

## ✅ Corrections Appliquées

### 1. **RoleBasedRedirect.tsx** - CRITIQUE
- ✅ Whitelist des routes `/organisation` prioritaire (avant toute logique de redirection)
- ✅ Logique de redirection améliorée pour éviter les boucles
- ✅ Ne redirige QUE si l'utilisateur n'est PAS déjà sur une route appropriée

### 2. **useOrganisationData.tsx** - DÉJÀ CORRIGÉ
- ✅ Protection contre les appels concurrents avec `useRef`
- ✅ Dépendances useEffect correctes (organizationId au lieu de fetchOrganisation)
- ✅ Logs de debug pour tracer l'exécution

## 🎯 Tests à Effectuer

### Test 1: Navigation Normale vers Organisation
```
1. Ouvrez http://localhost:8081
2. Connectez-vous
3. Cliquez sur "Organisation" dans la sidebar
4. ✅ ATTENDU: Aller directement au dashboard sans boucle
5. ❌ PROBLÈME: Alternance entre /organisation/:id/dashboard et /setup-organization
```

### Test 2: Accès Direct à l'URL
```
1. Copiez l'URL: http://localhost:8081/organisation/9c74a67a-0ffa-4427-9743-a0c732e99889/dashboard
2. Collez dans une nouvelle tab
3. ✅ ATTENDU: Charger directement le dashboard
4. ❌ PROBLÈME: Redirection vers /setup-organization puis retour
```

### Test 3: Logs Console
Ouvrez F12 → Console et cherchez:

#### ✅ Logs Attendus (Bon Fonctionnement):
```
[RoleBasedRedirect] Current path: /organisation/9c74a67a-0ffa-4427-9743-a0c732e99889/dashboard
[RoleBasedRedirect] Path is whitelisted, no redirect
[useOrganisationData] Fetching organisation: 9c74a67a-0ffa-4427-9743-a0c732e99889
[useOrganisationData] Organisation loaded successfully
```

#### ❌ Logs Problématiques (Boucle):
```
[RoleBasedRedirect] Redirecting to: /setup-organization
[SetupOrganization] Organization exists and setup complete, redirecting to dashboard
[RoleBasedRedirect] Redirecting to: /setup-organization
... (répété infiniment)
```

## 🐛 Si le Problème Persiste

### Cause Possible #1: Race Condition dans useUserRole
Le hook `useUserRole` combine le chargement de `userProfile` + `organizationId`. Si l'un des deux n'est pas encore chargé, `loading` peut être `true` pendant que l'autre partie de la logique se déclenche.

**Solution**: Vérifier que `useUserOrganizationId` se charge correctement:

```typescript
// Dans la console browser
localStorage.clear(); // Clear auth state
window.location.reload(); // Refresh
```

### Cause Possible #2: Données Inconsistantes BDD
L'utilisateur a un `organizationId` dans `user_organizations` MAIS `organization_setup_pending = true` dans `profiles`.

**Vérification SQL**:
```sql
SELECT 
  p.id as user_id,
  p.user_role,
  p.organization_setup_pending,
  uo.organization_id,
  uo.status as uo_status,
  o.name as org_name
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
LEFT JOIN organizations o ON uo.organization_id = o.id
WHERE p.user_role IN ('organisation', 'staff');
```

**Attendu pour un utilisateur qui fonctionne**:
- `organization_setup_pending = false`
- `uo.organization_id` NOT NULL
- `uo_status = 'active'`

### Cause Possible #3: OrganisationRouteGuard Conflit
Vérifier que `OrganisationRouteGuard` ne fait pas sa propre redirection.

**Logs à surveiller**:
```
[OrganisationRouteGuard] User has org role but no organizationId - redirecting to setup
```

Si ce log apparaît, c'est que `organizationId` n'est pas chargé correctement dans le guard.

## 🔧 Debug Rapide

### 1. Vérifier l'État des Hooks
Ajoutez temporairement dans `RoleBasedRedirect.tsx`:

```typescript
console.log('[DEBUG] Full state:', {
  userRole,
  organizationId,
  roleLoading,
  userProfile: userProfile ? {
    id: userProfile.id,
    user_role: userProfile.user_role,
    organization_setup_pending: userProfile.organization_setup_pending
  } : null,
  currentPath: location.pathname
});
```

### 2. Tester les Hooks Individuellement
Dans la console browser:

```javascript
// Tester le chargement des données utilisateur
fetch('/api/user-profile').then(r => r.json()).then(console.log);
```

### 3. Forcer une Redirection Manuelle
```javascript
// Dans la console
window.location.href = '/organisation/9c74a67a-0ffa-4427-9743-a0c732e99889/dashboard';
```

Si ça marche manuellement mais pas via navigation normale, c'est un problème de timing dans les hooks.

## 📈 Métriques de Succès

- [ ] Plus d'alternance d'URLs toutes les secondes
- [ ] Dashboard se charge en < 3 secondes
- [ ] Console propre (pas de logs en boucle)
- [ ] Navigation sidebar fonctionne
- [ ] Refresh (F5) fonctionne

## 🚨 Rollback Plan

Si les corrections empirent le problème:

```bash
git checkout src/components/RoleBasedRedirect.tsx
git commit -m "revert: rollback RoleBasedRedirect changes"
```

Puis réessayer avec une approche différente (ex: désactiver temporairement RoleBasedRedirect).