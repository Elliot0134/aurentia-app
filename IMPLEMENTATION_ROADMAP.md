# 🗺️ Implementation Roadmap - Organisation Module Completion

## 📊 Overall Progress: 60% Complete

---

## ✅ Phase 1: Data Foundation & UI Enhancement (COMPLETED)

### Database Analysis ✓
- [x] Audit all requested fields against existing schema
- [x] Identify 57% available data vs 43% missing data
- [x] Document findings in ORGANISATION_DATA_AUDIT_REPORT.md

### Table Configuration Enhancement ✓
- [x] Enhanced mentors table (11 fields, 4-tab modal)
- [x] Enhanced adherents table (17 fields, 4-tab modal with "Relancer Cotisation")
- [x] Enhanced projets table (14 fields, modal tabs)
- [x] Update data mapping in page components

### Database Migration Script ✓
- [x] Create comprehensive migration SQL file
- [x] Add 8 columns to mentors table
- [x] Add 6 columns to profiles table
- [x] Add 10 columns to projects table
- [x] Create member_subscriptions table
- [x] Create user_activity_log table
- [x] Add helper functions and RLS policies

### Documentation ✓
- [x] ORGANISATION_DATA_AUDIT_REPORT.md
- [x] PHASE_1_IMPLEMENTATION_COMPLETE.md
- [x] ONBOARDING_FLOWS_SPECIFICATION.md
- [x] IMPLEMENTATION_SUMMARY.md

---

## ✅ Phase 2: Project Validation System (COMPLETED)

### Component Development ✓
- [x] ProjectOrganisationExtendedForm.tsx (4 card sections)
- [x] ApplyProjectToOrganisation.tsx (validation workflow)

### Integration ✓
- [x] Integrate ApplyProjectToOrganisation into MyOrganization.tsx
- [x] Add import statements and conditional rendering

### Documentation ✓
- [x] PROJECT_VALIDATION_SYSTEM_IMPLEMENTED.md

---

## ⏳ Phase 3: Project Creation Flow Enhancement (IN PROGRESS)

**Estimated Time:** 4-6 hours

### Step 1: Update Database Migration (30 min)
**File:** `db_migrations/20251004_add_organisation_extended_fields.sql`

- [ ] Add validation_status column to project_summary
- [ ] Add linked_to_organization column to project_summary
- [ ] Add extended project fields to projects table
- [ ] Add indexes for performance
- [ ] Test migration in development

### Step 2: Integrate Extended Form (2-3 hours)
**File:** `src/pages/FormBusinessIdea.tsx`

Tasks:
- [ ] Read full FormBusinessIdea.tsx to understand current flow
- [ ] Import ProjectOrganisationExtendedForm
- [ ] Add extendedFormData state
- [ ] Identify correct step number for extended form
- [ ] Add conditional rendering for extended form step
- [ ] Wire up navigation (prev/next buttons)
- [ ] Update form submission to include extended data
- [ ] Set validation_status = 'pending' for organization projects
- [ ] Test complete flow

**Code Structure:**
```typescript
// State management
const [extendedFormData, setExtendedFormData] = useState({...});

// Conditional step rendering
{currentStep === EXTENDED_STEP && selectedOrganization && (
  <ProjectOrganisationExtendedForm
    formData={extendedFormData}
    onChange={setExtendedFormData}
  />
)}

// Submission
const handleSubmit = async () => {
  const projectData = {
    ...baseFormData,
    ...extendedFormData, // Include extended fields
    validation_status: selectedOrganization ? 'pending' : 'validated'
  };
};
```

### Step 3: Update Projects Table Config (1 hour)
**File:** `src/config/tables/projets.config.tsx`

- [ ] Add validation_status column with badges
- [ ] Add filtering by validation status
- [ ] Add visual indicators for pending projects
- [ ] Test table rendering

### Step 4: Prevent Mentor Assignment (1 hour)
**Files:** Find mentor assignment logic

- [ ] Search for mentor assignment code
- [ ] Add validation status check
- [ ] Show error message if project not validated
- [ ] Test assignment prevention

---

## ⏳ Phase 4: Onboarding Flows (NEXT PRIORITY)

**Estimated Time:** 8-10 hours

### Mentor Onboarding Wizard (4 hours)
**File to Create:** `src/pages/onboarding/MentorOnboarding.tsx`

**Template:** Follow `src/pages/OrganisationOnboarding.tsx` pattern

**Steps:**
1. Personal Information (name, email, phone, photo)
2. Professional Expertise (bio, linkedin, expertise areas[])
3. Availability & Capacity (availability{}, max_projects, max_entrepreneurs)
4. Review & Submit

**Tasks:**
- [ ] Create MentorOnboarding.tsx file
- [ ] Implement 4-step wizard with slide transitions
- [ ] Add form validation for each step
- [ ] Create ImageUploader integration for photo
- [ ] Wire up to mentors table submission
- [ ] Add success redirect to dashboard
- [ ] Add route in router/index.tsx
- [ ] Test complete flow

**Data to Collect:**
```typescript
{
  // Step 1
  full_name: string,
  email: string,
  phone: string,
  photoUrl: string,
  
  // Step 2
  bio: string,
  linkedin_url: string,
  expertise: string[], // Tags
  speciality: string,
  
  // Step 3
  availability: {
    monday: boolean,
    tuesday: boolean,
    // ... etc
    timeSlots: string[]
  },
  max_projects: number,
  max_entrepreneurs: number,
  
  // Auto-filled
  organization_id: from user profile
}
```

### Adherent Onboarding Wizard (4 hours)
**File to Create:** `src/pages/onboarding/AdherentOnboarding.tsx`

**Template:** Follow `src/pages/OrganisationOnboarding.tsx` pattern

**Steps:**
1. Personal Information (name, email, phone, photo)
2. Program Selection (program_type, cohort_year)
3. Professional Details (linkedin, website, availability_schedule)
4. Subscription (training_budget, payment confirmation)
5. Welcome & Next Steps

**Tasks:**
- [ ] Create AdherentOnboarding.tsx file
- [ ] Implement 5-step wizard with slide transitions
- [ ] Add form validation
- [ ] Add ImageUploader for photo
- [ ] Wire up to profiles table submission
- [ ] Create initial member_subscriptions record
- [ ] Add success redirect
- [ ] Add route in router
- [ ] Test complete flow

**Data to Collect:**
```typescript
{
  // Step 1
  full_name: string,
  email: string,
  phone: string,
  photoUrl: string,
  
  // Step 2
  program_type: string, // Dropdown
  cohort_year: number,
  
  // Step 3
  linkedin_url: string,
  website: string,
  availability_schedule: {
    // Similar to mentors
  },
  
  // Step 4
  training_budget: number,
  subscription_amount: number,
  payment_confirmed: boolean,
  
  // Auto-filled
  organization_id: from user profile,
  credits_remaining: 10 (initial),
  subscription_status: 'active'
}
```

### Route Integration (1 hour)
**File:** `src/router/index.tsx`

- [ ] Add `/onboarding/mentor` route
- [ ] Add `/onboarding/adherent` route
- [ ] Add route guards (must be logged in)
- [ ] Add redirect logic (skip if already completed)
- [ ] Test routing

### Onboarding Triggers (1 hour)
**Logic:** Determine when to show onboarding

Options:
1. **On First Login** - Check if profile complete, redirect if not
2. **Manual Trigger** - Add "Complete Onboarding" button in dashboard
3. **Invitation-Based** - Trigger when invited to organization

**Tasks:**
- [ ] Add `onboarding_completed` field to profiles
- [ ] Create useOnboardingStatus hook
- [ ] Add onboarding check in App.tsx or layout
- [ ] Test trigger logic

---

## ⏳ Phase 5: Admin Validation Interface (FUTURE)

**Estimated Time:** 6-8 hours

### Project Validation Dashboard
**File to Create:** `src/pages/organisation/OrganisationProjectValidation.tsx`

**Features:**
- List all pending projects
- Show extended project details
- Validate/Reject buttons
- Comment/feedback field
- Activity logging

**Tasks:**
- [ ] Create validation dashboard page
- [ ] Add filtering (pending, validated, rejected)
- [ ] Create project detail modal
- [ ] Add validation form with comments
- [ ] Wire up database updates
- [ ] Add email notifications
- [ ] Add to organization navigation
- [ ] Test validation workflow

---

## 📅 Timeline Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Data Foundation | 2 days | ✅ Complete |
| Phase 2: Validation System | 1 day | ✅ Complete |
| Phase 3: Project Creation | 1 day | ⏳ 0% |
| Phase 4: Onboarding Flows | 2 days | ⏳ 0% |
| Phase 5: Admin Validation | 1.5 days | 🔮 Future |
| **Total** | **7.5 days** | **40% Complete** |

---

## 🎯 Recommended Next Steps (Priority Order)

### Immediate (Today/Tomorrow)
1. **Run Database Migration** ✅ Critical
   - Update migration file with validation_status
   - Test in development environment
   - Deploy to staging

2. **Integrate Extended Form** 🔥 High Priority
   - Read FormBusinessIdea.tsx fully
   - Add extended form step
   - Test project creation flow

3. **Update Projects Table** 📊 High Priority
   - Add validation status badges
   - Test filtering and display

### This Week
4. **Create Mentor Onboarding** 👨‍🏫
   - Follow OrganisationOnboarding pattern
   - 4-step wizard implementation
   - Test and polish

5. **Create Adherent Onboarding** 👩‍💼
   - Follow OrganisationOnboarding pattern
   - 5-step wizard implementation
   - Test and polish

6. **Add Onboarding Routing** 🛣️
   - Integrate into router
   - Add trigger logic
   - Test user flow

### Next Week
7. **Build Admin Validation UI** 👑
   - Create validation dashboard
   - Add comment system
   - Test approval workflow

8. **Polish & Testing** ✨
   - End-to-end testing
   - UI/UX improvements
   - Performance optimization

---

## 🔧 Development Tips

### Working with FormBusinessIdea.tsx
```bash
# First, understand the current step flow
grep -n "currentStep ===" src/pages/FormBusinessIdea.tsx

# Find where organization is selected
grep -n "organization" src/pages/FormBusinessIdea.tsx

# Check form submission
grep -n "submit\|handleSubmit" src/pages/FormBusinessIdea.tsx
```

### Testing Extended Form Integration
1. Create new project
2. Select an organization
3. Verify extended form appears
4. Fill all fields
5. Submit and check database
6. Verify validation_status = 'pending'

### Testing Onboarding Flows
1. Create test account
2. Navigate to onboarding URL
3. Complete all steps
4. Verify data saves correctly
5. Check redirect works
6. Verify onboarding_completed flag set

---

## 📋 Testing Checklist

### Database Migration
- [ ] Migration runs without errors
- [ ] All columns created correctly
- [ ] Indexes added successfully
- [ ] RLS policies work as expected
- [ ] Existing data preserved

### Project Creation Flow
- [ ] Extended form appears when organization selected
- [ ] All fields editable and save correctly
- [ ] Navigation (back/next) works
- [ ] Form validation prevents submission with missing data
- [ ] Project created with validation_status = 'pending'
- [ ] Individual projects still work (no organization selected)

### Apply Existing Project
- [ ] Component renders in MyOrganization
- [ ] Dropdown shows user's projects
- [ ] Can't apply already-linked projects
- [ ] Confirmation dialog works
- [ ] Database updates correctly
- [ ] Success toast appears
- [ ] Activity logged

### Mentor Onboarding
- [ ] All 4 steps render correctly
- [ ] Form validation works
- [ ] Image upload successful
- [ ] Data saves to mentors table
- [ ] Redirect after completion
- [ ] Can't access if already completed

### Adherent Onboarding
- [ ] All 5 steps render correctly
- [ ] Form validation works
- [ ] Subscription step calculates correctly
- [ ] Data saves to profiles table
- [ ] member_subscriptions record created
- [ ] Redirect after completion

---

## 🐛 Known Issues & Considerations

### Data Migration
- **Issue:** Existing projects will default to validation_status = 'pending'
- **Solution:** Add data migration script to set existing projects to 'validated'

```sql
-- Run after adding validation_status column
UPDATE project_summary
SET validation_status = 'validated'
WHERE created_at < NOW() AND validation_status IS NULL;
```

### Onboarding State Management
- **Issue:** User might close browser mid-onboarding
- **Solution:** Save progress to localStorage or database temp table

### Form Validation
- **Issue:** Extended form might be skipped by clever users
- **Solution:** Server-side validation on project submission

---

## 📚 Resources

### Pattern References
- **Multi-Step Wizard:** `src/pages/OrganisationOnboarding.tsx`
- **Form Components:** `src/components/project/ProjectOrganisationExtendedForm.tsx`
- **Data Tables:** `src/config/tables/*.config.tsx`
- **Service Layer:** `src/services/organisationService.ts`

### Documentation
- [PROJECT_VALIDATION_SYSTEM_IMPLEMENTED.md](./PROJECT_VALIDATION_SYSTEM_IMPLEMENTED.md)
- [ONBOARDING_FLOWS_SPECIFICATION.md](./ONBOARDING_FLOWS_SPECIFICATION.md)
- [ORGANISATION_DATA_AUDIT_REPORT.md](./ORGANISATION_DATA_AUDIT_REPORT.md)

---

## 🎉 Success Criteria

The implementation will be complete when:

✅ Users can create projects with extended info when organization selected  
✅ Users can apply existing projects to organization  
✅ All projects go through validation workflow  
✅ Mentors cannot be assigned until project validated  
✅ Mentors can complete onboarding via wizard  
✅ Adherents can complete onboarding via wizard  
✅ All data saves correctly to database  
✅ UI is polished and user-friendly  
✅ Documentation is complete and accurate  

---

**Current Status:** Phase 2 Complete | Phase 3 Ready to Start  
**Next Action:** Update database migration and integrate extended form  
**Estimated Time to MVP:** 2-3 days of focused work  

**Last Updated:** January 2025
