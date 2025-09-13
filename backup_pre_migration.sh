#!/bin/bash

# =====================================================
# SCRIPT DE BACKUP PRÉ-MIGRATION AURENTIA
# =====================================================

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
SUPABASE_URL="https://llcliurrrrxnkquwmwsi.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY2xpdXJycnJ4bmtxdXdtd3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDMwOTEsImV4cCI6MjA1MzQ3OTA5MX0.UWfFrlMEQRvRhXYUORmUhrc1A6WLAJbLBnpCWAVaWSQ"

echo "🚀 Démarrage du backup pré-migration Aurentia"
echo "📅 Timestamp: $TIMESTAMP"

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

echo "📊 1. Vérification de l'intégrité des données actuelles..."

# Créer un script SQL de vérification
cat > $BACKUP_DIR/pre_migration_check_$TIMESTAMP.sql << 'EOF'
-- Vérification de l'intégrité des données avant migration
SELECT 
  'profiles' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN credits_restants IS NOT NULL THEN 1 END) as records_with_credits,
  COUNT(CASE WHEN credits_restants ~ '^[0-9]+$' THEN 1 END) as valid_credit_format
FROM public.profiles
UNION ALL
SELECT 
  'project_summary' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN statut_project IS NOT NULL THEN 1 END) as records_with_status,
  COUNT(CASE WHEN statut_project IN ('pay_1_waiting', 'pay_2_waiting', 'plan1', 'plan2') THEN 1 END) as old_payment_statuses
FROM public.project_summary;

-- Identifier les données problématiques
SELECT 
  'PROBLEMATIC_PROFILES' as issue_type,
  id, 
  email, 
  credits_restants, 
  credit_limit 
FROM public.profiles 
WHERE credits_restants IS NOT NULL 
  AND (credits_restants !~ '^[0-9]+$' OR credit_limit !~ '^[0-9]+$')
LIMIT 10;

-- Statistiques des crédits actuels
SELECT 
  'CREDIT_STATS' as info_type,
  AVG(CAST(COALESCE(NULLIF(credits_restants, ''), '0') AS INTEGER)) as avg_credits,
  MAX(CAST(COALESCE(NULLIF(credits_restants, ''), '0') AS INTEGER)) as max_credits,
  MIN(CAST(COALESCE(NULLIF(credits_restants, ''), '0') AS INTEGER)) as min_credits,
  SUM(CAST(COALESCE(NULLIF(credits_restants, ''), '0') AS INTEGER)) as total_credits
FROM public.profiles 
WHERE credits_restants ~ '^[0-9]+$';
EOF

echo "💾 2. Export CSV des données critiques..."

# Export des données utilisateurs (sécurité supplémentaire)
cat > $BACKUP_DIR/export_users_$TIMESTAMP.sql << 'EOF'
\copy (SELECT id, email, credits_restants, credit_limit, created_at, updated_at FROM public.profiles) TO 'users_backup.csv' WITH CSV HEADER;
\copy (SELECT project_id, user_id, statut_project, created_at, updated_at FROM public.project_summary) TO 'projects_backup.csv' WITH CSV HEADER;
EOF

echo "📋 3. Création du script de rollback..."

cat > $BACKUP_DIR/rollback_migration_$TIMESTAMP.sql << 'EOF'
-- SCRIPT DE ROLLBACK EN CAS DE PROBLÈME
-- À exécuter UNIQUEMENT si la migration échoue

BEGIN;

-- Supprimer le schéma billing si créé
DROP SCHEMA IF EXISTS billing CASCADE;

-- Restaurer les anciens statuts de projet si nécessaire
-- (Cette partie sera adaptée selon les besoins)

-- Restaurer les données depuis les CSV si nécessaire
-- TRUNCATE public.profiles;
-- \copy public.profiles FROM 'users_backup.csv' WITH CSV HEADER;

ROLLBACK; -- Remplacer par COMMIT; après vérification
EOF

echo "📝 4. Génération du rapport de migration..."

cat > $BACKUP_DIR/migration_report_$TIMESTAMP.md << EOF
# Rapport de Migration Aurentia - $TIMESTAMP

## 📊 État Avant Migration

### Tables Principales
- **profiles**: Contient les crédits utilisateurs (format TEXT)
- **project_summary**: Contient les statuts de projets
- **user_credits**: Table basique existante

### Changements Prévus
1. **Nouveau schéma billing** avec 5 tables
2. **Migration des crédits** de TEXT vers INTEGER
3. **Nouveau système d'abonnement** avec priorité de déduction
4. **Suppression des anciens plans** (plan1, plan2)

### Données à Migrer
- Utilisateurs avec crédits existants
- Projets avec anciens statuts de paiement
- Historique des transactions (nouveau)

## 🔧 Scripts Créés
- \`pre_migration_check_$TIMESTAMP.sql\`: Vérification intégrité
- \`export_users_$TIMESTAMP.sql\`: Export CSV sécurité
- \`rollback_migration_$TIMESTAMP.sql\`: Script de rollback

## ⚠️ Points d'Attention
1. Vérifier que tous les utilisateurs ont des crédits valides
2. S'assurer que les projets en cours ne sont pas impactés
3. Tester les fonctions SQL avant la mise en production
4. Valider les webhooks N8N après migration

## 📞 Contact
En cas de problème, contacter l'équipe technique avec ce rapport.
EOF

echo "✅ Backup pré-migration terminé !"
echo "📁 Fichiers créés dans: $BACKUP_DIR/"
echo ""
echo "🔍 Prochaines étapes:"
echo "1. Exécuter les vérifications: psql -f $BACKUP_DIR/pre_migration_check_$TIMESTAMP.sql"
echo "2. Exporter les CSV: psql -f $BACKUP_DIR/export_users_$TIMESTAMP.sql"
echo "3. Lancer la migration: psql -f db_billing_schema_migration.sql"
echo "4. Créer les fonctions: psql -f db_billing_functions.sql"
echo ""
echo "⚠️  IMPORTANT: Gardez ce dossier de backup jusqu'à validation complète !"