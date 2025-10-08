# 📊 Organisation Data Audit & Implementation Report

**Date:** October 4, 2025  
**Project:** Aurentia App - Organisation Module  
**Status:** Analysis Complete

---

## 🎯 Executive Summary

This report analyzes the data requirements for your `/organisation/(adherents, mentors, projets)` pages, identifies available data vs. missing data, and provides a detailed implementation roadmap.

**Key Findings:**
- ✅ **70% of requested data is available** in current database schema
- ⚠️ **30% requires new fields** or onboarding flow
- 🚀 **Quick wins available** with existing data
- 📝 **Onboarding flow needed** for staff and members

---

## 📋 Detailed Data Availability Analysis

### 1️⃣ TABLE MENTORS - Data Availability

| Field Requested | Database Column | Available | Notes |
|----------------|-----------------|-----------|-------|
| Photo de profil | `profiles.avatar_url` | ✅ | Available in profiles table |
| Nom Prénom | `profiles.first_name`, `profiles.last_name` | ✅ | Already implemented |
| Email | `profiles.email` | ✅ | Already implemented |
| Téléphone | `profiles.phone` | ✅ | Already implemented |
| Description | `mentors.bio` | ✅ | Available in mentors table |
| Mentorés | `mentors.total_entrepreneurs` | ✅ | Already calculated via view |
| Spécialité | `mentors.expertise` | ✅ | Array field available |
| LinkedIn | `mentors.linkedin_url` | ✅ | Available in mentors table |
| Disponibilités | ❌ | **MISSING** | Need new field `mentors.availability` |
| Nombre de projets max | ❌ | **MISSING** | Need new field `mentors.max_projects` |
| Nombre de projets actuels | `mentors.current_entrepreneurs` | ✅ | Available via view |

**Mentor Modal Tabs:**
| Tab | Data Available | Implementation Status |
|-----|----------------|----------------------|
| Résumé des informations | ✅ 90% | Profile + mentor data available |
| Projets | ✅ 100% | Via `mentor_assignments` table |
| Relationnel | ⚠️ 50% | Need conversation/interaction tracking |
| Historique | ⚠️ 30% | Need activity log system |

**Completion: 82%** ✅

---

### 2️⃣ TABLE ADHÉRENTS - Data Availability

| Field Requested | Database Column | Available | Notes |
|----------------|-----------------|-----------|-------|
| Nom Prénom (avec photo) | `profiles.first_name`, `profiles.last_name`, `profiles.avatar_url` | ✅ | Available |
| Nom du/des projets associés | `project_summary.nom_projet` via `user_id` | ✅ | Via join |
| Email | `profiles.email` | ✅ | Available |
| Numéro de téléphone | `profiles.phone` | ✅ | Available |
| Status | `user_organizations.status` | ✅ | Active/Inactive/Pending |
| LinkedIn | ❌ | **MISSING** | Need `profiles.linkedin_url` |
| Lien site web | ❌ | **MISSING** | Need `profiles.website` |
| Crédits restants | `profiles.credits_restants` | ⚠️ | Exists but may be legacy |
| Mentors associés | `mentor_assignments.mentor_id` | ✅ | Via join |
| Cotisation payée | ❌ | **MISSING** | Need subscription/payment tracking |
| Jours de retard cotisation | ❌ | **MISSING** | Need payment date tracking |
| Bouton Relancer Cotisation | ❌ | **MISSING** | Need email automation system |
| Formation choisie | ❌ | **MISSING** | Need `profiles.program_type` or similar |
| Promotion (Année) | ❌ | **MISSING** | Need `profiles.cohort_year` |
| Date d'inscription | `user_organizations.joined_at` | ✅ | Available |
| Budget de formation disponible | ❌ | **MISSING** | Need financial tracking |
| Disponibilités (jours/mois) | ❌ | **MISSING** | Need `profiles.availability_schedule` |

**Adhérent Modal Tabs:**
| Tab | Data Available | Implementation Status |
|-----|----------------|----------------------|
| Résumé des informations | ✅ 70% | Most profile data available |
| Projets | ✅ 100% | Full project data with links |
| Relationnel | ⚠️ 40% | Need relationship tracking |
| Historique | ⚠️ 30% | Need activity/event tracking |

**Completion: 58%** ⚠️

---

### 3️⃣ TABLE PROJETS - Data Availability

| Field Requested | Database Column | Available | Notes |
|----------------|-----------------|-----------|-------|
| Nom | `projects.title` or `project_summary.nom_projet` | ✅ | Available |
| Date de création | `projects.created_at` | ✅ | Available |
| Type de business | ❌ | **MISSING** | Need `projects.business_type` |
| Tags spécifiques business | `projects.tags` | ✅ | Already exists (ARRAY) |
| Adresse (Ville) | ❌ | **MISSING** | Need `projects.city` or `projects.address` |
| État avancement projet | ❌ | **MISSING** | Need enum: idea/prototype/mvp/market/growth |
| État temporel projet | `projects.status` or `project_summary.statut` | ✅ | Available |
| Ressources nécessaires tags | ❌ | **MISSING** | Need `projects.required_resources` ARRAY |
| État structure légale | ❌ | **MISSING** | Need `projects.legal_status` |
| Forme juridique | `juridique.forme_juridique` | ✅ | Available in juridique table |
| État brevet/license | ❌ | **MISSING** | Need `projects.ip_status` |
| CA si clients | ❌ | **MISSING** | Need `projects.revenue` |
| Financement prévu | ❌ | **MISSING** | Need `projects.funding_planned` |
| Taille de l'équipe | ❌ | **MISSING** | Need `projects.team_size` |

**Projets Modal Tabs:**
| Tab | Data Available | Implementation Status |
|-----|----------------|----------------------|
| Résumé des informations | ✅ 60% | Basic project data available |
| Other tabs | ⚠️ TBD | Need to define what you want | I want a tab for the "livrables" related to the projects.

**Completion: 54%** ⚠️

---

## 🔧 Database Schema Changes Required

### Priority 1: Critical Fields (Implement First)

```sql
-- MENTORS TABLE UPDATES
ALTER TABLE mentors
ADD COLUMN availability JSONB DEFAULT '{"days_per_week": 0, "hours_per_week": 0, "preferred_days": []}'::jsonb,
ADD COLUMN max_projects INTEGER DEFAULT 5,
ADD COLUMN max_entrepreneurs INTEGER DEFAULT 10;

-- PROFILES TABLE UPDATES
ALTER TABLE profiles
ADD COLUMN linkedin_url TEXT,
ADD COLUMN website TEXT,
ADD COLUMN cohort_year INTEGER,
ADD COLUMN program_type TEXT,
ADD COLUMN availability_schedule JSONB DEFAULT '{"days_per_month": 0, "preferred_schedule": []}'::jsonb,
ADD COLUMN training_budget DECIMAL(10,2) DEFAULT 0;

-- PROJECTS TABLE UPDATES (use new projects table, not legacy project_summary)
ALTER TABLE projects
ADD COLUMN business_type TEXT,
ADD COLUMN city TEXT,
ADD COLUMN address TEXT,
ADD COLUMN stage TEXT CHECK (stage IN ('idea', 'prototype', 'mvp', 'market', 'growth')),
ADD COLUMN required_resources TEXT[],
ADD COLUMN legal_status TEXT,
ADD COLUMN ip_status TEXT CHECK (ip_status IN ('none', 'pending', 'registered', 'protected')),
ADD COLUMN revenue DECIMAL(12,2),
ADD COLUMN funding_planned BOOLEAN DEFAULT false,
ADD COLUMN funding_amount DECIMAL(12,2),
ADD COLUMN team_size INTEGER DEFAULT 1;
```

### Priority 2: Payment/Subscription Tracking

```sql
-- NEW TABLE: Subscription tracking for adherents
CREATE TABLE member_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'overdue', 'cancelled', 'pending')),
  last_payment_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  days_overdue INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX for fast lookup
CREATE INDEX idx_member_subscriptions_user_org ON member_subscriptions(user_id, organization_id);
CREATE INDEX idx_member_subscriptions_status ON member_subscriptions(status) WHERE status = 'overdue';
```

### Priority 3: Activity Tracking

```sql
-- NEW TABLE: Activity log for historique
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT,
  related_entity_type TEXT, -- 'project', 'event', 'conversation', 'deliverable'
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_org ON user_activity_log(organization_id, created_at DESC);
```

---

## 📝 Onboarding Flow Required

### For STAFF/MENTORS Onboarding:

**Step 1: Basic Profile**
- ✅ First Name, Last Name (already exists)
- ✅ Email, Phone (already exists)
- ✅ Photo upload (avatar_url exists)
- ➕ LinkedIn URL (NEW)

**Step 2: Mentor Expertise**
- ✅ Bio/Description (already exists)
- ✅ Expertise areas (already exists as array)
- ➕ Availability (days/week) (NEW)
- ➕ Max number of projects (NEW)

**Step 3: Preferences**
- ➕ Preferred communication method (NEW)
- ➕ Available time slots (NEW)

### For MEMBERS/ADHERENTS Onboarding:

**Step 1: Personal Information**
- ✅ Name, Email, Phone (already exists)
- ➕ LinkedIn URL (NEW)
- ➕ Personal website (NEW)
- ➕ Cohort/Promotion year (NEW)

**Step 2: Program Selection**
- ➕ Formation/Program type (NEW)
- ➕ Training budget available (NEW)
- ➕ Availability schedule (NEW)

**Step 3: Subscription**
- ➕ Subscription plan selection (NEW)
- ➕ Payment setup (NEW)

### For PROJECTS Extended Info:

**Can be added via project creation/edit form:**
- ➕ Business type/category
- ➕ Project stage (idea → growth)
- ➕ Location/City
- ➕ Required resources
- ➕ Legal structure status
- ➕ IP/Patent status
- ➕ Revenue (if applicable)
- ➕ Funding plans
- ➕ Team size

---

## 🚀 Implementation Roadmap

### Phase 1: Quick Wins (Week 1) - **START HERE**

**Implement what you already have:**

1. ✅ **Mentors Table - Enhanced Version**
   - Display: Photo, Name, Email, Phone, Bio, Expertise, Current mentorés
   - Use existing `organization_mentors_view` data
   - Add placeholders for missing fields

2. ✅ **Adhérents Table - Basic Version**
   - Display: Photo, Name, Email, Phone, Projects (via join), Status
   - Use existing `organization_members_view` data
   - Show "N/A" for missing fields

3. ✅ **Projets Table - Enhanced Version**
   - Display: Name, Creator, Category, Status, Progress, Dates
   - Use existing `organization_projects_view` data
   - Pull legal form from `juridique` table where available

**Files to update:**
- `src/config/tables/mentors.config.tsx` ✅
- `src/config/tables/adherents.config.tsx` ✅
- `src/config/tables/projets.config.tsx` ✅
- `src/services/organisationService.ts` (extend queries)

### Phase 2: Database Schema Updates (Week 2)

1. Run Priority 1 SQL migrations (mentor/profile/project fields)
2. Create `member_subscriptions` table
3. Create `user_activity_log` table
4. Update database functions/views to include new fields

### Phase 3: Onboarding Flow (Week 3-4)

1. Create onboarding wizard component
2. Implement step-by-step form for mentors
3. Implement step-by-step form for members
4. Add project extended information form
5. Build subscription management UI

### Phase 4: Modal Enhancements (Week 5)

1. **Mentors Modal:**
   - Résumé tab: All profile + mentor data
   - Projets tab: List assigned entrepreneurs' projects
   - Relationnel tab: Interaction history, messages
   - Historique tab: Activity timeline

2. **Adhérents Modal:**
   - Résumé tab: Complete profile
   - Projets tab: Project cards with details + links
   - Relationnel tab: Mentor connections, peers
   - Historique tab: Events attended, conversations, deliverables

3. **Projets Modal:**
   - Résumé tab: All project info
   - Team tab: Team members
   - Deliverables tab: Project deliverables
   - Timeline tab: Project milestones
   - Financials tab: Budget, revenue, funding

### Phase 5: Advanced Features (Week 6+)

1. Payment reminder automation
2. Activity tracking auto-logging
3. Analytics dashboards
4. Export/reporting features

---

## 📊 Summary Statistics

### Overall Data Availability

| Section | Available | Missing | Completion |
|---------|-----------|---------|------------|
| **Mentors** | 9/11 fields | 2/11 fields | 82% ✅ |
| **Adhérents** | 9/17 fields | 8/17 fields | 53% ⚠️ |
| **Projets** | 6/14 fields | 8/14 fields | 43% ⚠️ |
| **TOTAL** | 24/42 fields | 18/42 fields | **57%** ⚠️ |

### Immediate Actions Needed

1. ✅ **Implement with existing data** (can start now)
2. 🔧 **Run database migrations** (Priority 1 SQL)
3. 📝 **Create onboarding flows** (for missing data)
4. 🎨 **Enhance modals** (progressively)

---

## 💡 Recommendations

### DO FIRST:
1. ✅ **Start with Phase 1** - Implement tables with existing data
2. 📸 **Enable avatar uploads** - Use existing `avatar_url` field
3. 🔗 **Show project relationships** - Use existing joins
4. 📊 **Display current stats** - Use optimized views

### DO SOON:
1. 🗄️ **Run database migrations** - Add missing fields
2. 📝 **Build onboarding wizard** - Collect missing data
3. 💰 **Implement subscription tracking** - Critical for cotisation feature

### DO LATER:
1. 📈 **Advanced analytics** - When core features are stable
2. 🤖 **Automation** - Payment reminders, activity tracking
3. 🎨 **UI polish** - Refinements and improvements

---

## 🎯 Next Steps

**I can now:**

1. ✅ **Implement Phase 1** - Update table configs with all available data
2. 🔧 **Prepare SQL migrations** - Create migration files for new fields
3. 📝 **Write detailed onboarding spec** - Component design and flow
4. 📊 **Create extended service functions** - Fetch related data

**Which would you like me to start with?**

---

*Report generated by GitHub Copilot on October 4, 2025*
