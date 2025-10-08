# 📝 Onboarding Flows Specification

**Purpose:** Collect missing data from staff, mentors, and members  
**Status:** Specification - Ready for Implementation  
**Priority:** High - Required for data completion

---

## 🎯 Overview

Three onboarding flows are needed to complete the data:

1. **Staff/Mentor Onboarding** - For organization administrators and mentors
2. **Member/Adherent Onboarding** - For entrepreneurs and members
3. **Project Extended Info** - For project creators

---

## 1️⃣ Staff/Mentor Onboarding Flow

### Step 1: Personal Information
**Route:** `/onboarding/mentor/personal`

**Fields:**
```typescript
{
  firstName: string;           // ✅ Already exists
  lastName: string;            // ✅ Already exists
  email: string;               // ✅ Already exists
  phone: string;               // ✅ Already exists
  avatar: File;                // Upload to storage, save URL
  linkedinUrl: string;         // NEW - profiles.linkedin_url
  personalWebsite?: string;    // NEW - profiles.website
}
```

**UI Components:**
- Text inputs for name, email, phone
- File upload for avatar (with preview)
- URL inputs with validation

---

### Step 2: Professional Expertise
**Route:** `/onboarding/mentor/expertise`

**Fields:**
```typescript
{
  bio: string;                          // ✅ Already exists in mentors
  expertise: string[];                  // ✅ Already exists (multi-select)
  specializations: string[];            // Optional additional tags
  yearsOfExperience: number;           // Optional
  industries: string[];                // Optional
}
```

**UI Components:**
- Textarea for bio (max 500 chars)
- Multi-select dropdown for expertise areas
- Tag input for industries

**Expertise Options:**
```typescript
const expertiseOptions = [
  'Business Development',
  'Marketing & Sales',
  'Product Management',
  'Technology & Engineering',
  'Finance & Fundraising',
  'Legal & Compliance',
  'Operations & Logistics',
  'Human Resources',
  'Design & UX',
  'Strategy & Innovation'
];
```

---

### Step 3: Availability & Capacity
**Route:** `/onboarding/mentor/availability`

**Fields:**
```typescript
{
  availability: {
    daysPerWeek: number;            // NEW - 1-7
    hoursPerWeek: number;           // NEW - 1-40
    preferredDays: string[];        // NEW - ['Monday', 'Wednesday', 'Friday']
    preferredTimeSlots: string[];   // Optional - ['morning', 'afternoon', 'evening']
  };
  maxProjects: number;              // NEW - mentors.max_projects
  maxEntrepreneurs: number;         // NEW - mentors.max_entrepreneurs
  communicationPreference: string;  // Optional - ['email', 'phone', 'video', 'in-person']
}
```

**UI Components:**
- Number sliders for days/hours per week
- Multi-select for preferred days
- Number input for max capacity
- Radio group for communication preference

**Sample Component:**
```tsx
<AvailabilitySelector
  value={availability}
  onChange={setAvailability}
  showTimeSlots={true}
/>
```

---

### Step 4: Review & Confirm
**Route:** `/onboarding/mentor/review`

**Display:**
- Summary of all entered information
- Avatar preview
- Confirm button to save

**Actions:**
```typescript
const completeMentorOnboarding = async (data) => {
  // Update profiles table
  await supabase.from('profiles').update({
    first_name: data.firstName,
    last_name: data.lastName,
    phone: data.phone,
    avatar_url: data.avatarUrl,
    linkedin_url: data.linkedinUrl,
    website: data.personalWebsite,
  }).eq('id', userId);

  // Update or create mentor record
  await supabase.from('mentors').upsert({
    user_id: userId,
    organization_id: orgId,
    bio: data.bio,
    expertise: data.expertise,
    availability: data.availability,
    max_projects: data.maxProjects,
    max_entrepreneurs: data.maxEntrepreneurs,
  });

  // Log activity
  await log_user_activity(
    userId,
    orgId,
    'onboarding_completed',
    'Mentor onboarding completed'
  );
};
```

---

## 2️⃣ Member/Adherent Onboarding Flow

### Step 1: Personal Information
**Route:** `/onboarding/member/personal`

**Fields:**
```typescript
{
  firstName: string;           // ✅ Already exists
  lastName: string;            // ✅ Already exists
  email: string;               // ✅ Already exists
  phone: string;               // ✅ Already exists
  avatar: File;                // Upload to storage
  linkedinUrl?: string;        // NEW
  personalWebsite?: string;    // NEW
}
```

Same UI as mentor onboarding Step 1.

---

### Step 2: Program Selection
**Route:** `/onboarding/member/program`

**Fields:**
```typescript
{
  programType: string;         // NEW - profiles.program_type
  cohortYear: number;          // NEW - profiles.cohort_year
  trainingBudget?: number;     // NEW - profiles.training_budget
  objectives: string;          // Optional - what they want to achieve
}
```

**UI Components:**
- Dropdown for program type
- Year selector for cohort
- Currency input for budget
- Textarea for objectives

**Program Type Options:**
```typescript
const programTypes = [
  'Incubator - Full Time',
  'Incubator - Part Time',
  'Accelerator - 3 Months',
  'Accelerator - 6 Months',
  'Mentorship Program',
  'Workshop Series',
  'Custom Program'
];
```

---

### Step 3: Availability & Preferences
**Route:** `/onboarding/member/availability`

**Fields:**
```typescript
{
  availabilitySchedule: {
    daysPerMonth: number;           // NEW - 1-30
    preferredSchedule: string[];    // NEW - ['weekday_mornings', 'weekend_afternoons']
    timeZone: string;               // Optional
  };
  preferredMentorExpertise: string[];  // Optional - for matching
  preferredCommunication: string;      // Optional
}
```

**UI Components:**
- Number slider for days per month
- Multi-select for schedule preferences
- Timezone selector
- Multi-select for desired mentor expertise

---

### Step 4: Subscription Setup
**Route:** `/onboarding/member/subscription`

**Fields:**
```typescript
{
  subscriptionType: string;     // 'monthly_basic', 'quarterly_pro', etc.
  paymentFrequency: string;     // 'monthly', 'quarterly', 'yearly'
  autoRenew: boolean;           // Default true
  paymentMethod: string;        // Stripe setup
}
```

**UI Components:**
- Pricing cards for different plans
- Payment frequency toggle
- Stripe payment element
- Auto-renew checkbox

**Sample Plans:**
```typescript
const subscriptionPlans = [
  {
    id: 'monthly_basic',
    name: 'Basic',
    price: 50,
    frequency: 'monthly',
    features: ['Access to workshops', 'Monthly mentor session', 'Community access']
  },
  {
    id: 'quarterly_pro',
    name: 'Professional',
    price: 120,
    frequency: 'quarterly',
    features: ['All Basic features', 'Weekly mentor sessions', 'Priority support']
  },
  {
    id: 'yearly_premium',
    name: 'Premium',
    price: 400,
    frequency: 'yearly',
    features: ['All Pro features', 'Dedicated mentor', 'Private workshops']
  }
];
```

**Actions:**
```typescript
const createMemberSubscription = async (data) => {
  // Create Stripe payment
  const paymentIntent = await stripe.paymentIntents.create({
    amount: data.amount * 100,
    currency: 'eur',
    customer: stripeCustomerId,
  });

  // Create subscription record
  await supabase.from('member_subscriptions').insert({
    user_id: userId,
    organization_id: orgId,
    subscription_type: data.subscriptionType,
    amount: data.amount,
    status: 'active',
    payment_frequency: data.paymentFrequency,
    last_payment_date: new Date(),
    next_payment_date: calculateNextPayment(data.paymentFrequency),
    auto_renew: data.autoRenew,
  });
};

const calculateNextPayment = (frequency: string): Date => {
  const now = new Date();
  switch (frequency) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
};
```

---

### Step 5: Review & Welcome
**Route:** `/onboarding/member/complete`

**Display:**
- Summary of profile
- Summary of program
- Summary of subscription
- Welcome message
- Next steps guide

---

## 3️⃣ Project Extended Information

### Route: `/projects/:id/extended-info`

**When to show:**
- When creating a new project (after basic info)
- As a banner on existing projects that are incomplete
- From a "Complete Project Info" button

**Sections:**

### Business Context
```typescript
{
  businessType: string;           // NEW - 'SaaS', 'E-commerce', 'Service', etc.
  city: string;                   // NEW - Location
  address?: string;               // NEW - Optional full address
  stage: string;                  // NEW - 'idea', 'prototype', 'mvp', 'market', 'growth'
}
```

### Resources & Team
```typescript
{
  requiredResources: string[];    // NEW - ['Developer', 'Designer', 'Marketer']
  teamSize: number;               // NEW - Current team size
  hiringPlans?: string;           // Optional - Future hiring needs
}
```

### Legal & IP
```typescript
{
  legalStatus: string;            // NEW - 'created', 'in-progress', 'not-started'
  legalForm?: string;             // From juridique table
  ipStatus: string;               // NEW - 'none', 'pending', 'registered', 'protected'
  ipDetails?: string;             // Optional - Details about patents/trademarks
}
```

### Financials
```typescript
{
  revenue?: number;               // NEW - Current revenue (optional)
  fundingPlanned: boolean;        // NEW - Whether funding is planned
  fundingAmount?: number;         // NEW - Amount of funding sought
  fundingStage?: string;          // Optional - 'pre-seed', 'seed', 'series-a', etc.
}
```

**UI Flow:**
```tsx
<ProjectExtendedInfoWizard
  projectId={projectId}
  onComplete={handleComplete}
  steps={[
    'Business Context',
    'Resources & Team',
    'Legal & IP',
    'Financials'
  ]}
/>
```

---

## 🎨 Shared UI Components Needed

### 1. AvailabilitySelector
```tsx
interface AvailabilityProps {
  type: 'mentor' | 'member';
  value: AvailabilityData;
  onChange: (data: AvailabilityData) => void;
  showTimeSlots?: boolean;
}

<AvailabilitySelector
  type="mentor"
  value={availability}
  onChange={setAvailability}
  showTimeSlots={true}
/>
```

### 2. OnboardingWizard
```tsx
interface WizardProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: (data: any) => void;
}

<OnboardingWizard
  steps={mentorSteps}
  currentStep={step}
  onNext={handleNext}
  onPrevious={handlePrev}
  onComplete={handleComplete}
/>
```

### 3. SubscriptionPricingCards
```tsx
interface PricingCardsProps {
  plans: SubscriptionPlan[];
  selectedPlan?: string;
  onSelect: (planId: string) => void;
}

<SubscriptionPricingCards
  plans={subscriptionPlans}
  selectedPlan={selectedPlanId}
  onSelect={setPlanId}
/>
```

### 4. ProfileCompletionBanner
```tsx
interface BannerProps {
  completionPercentage: number;
  missingFields: string[];
  onComplete: () => void;
}

<ProfileCompletionBanner
  completionPercentage={65}
  missingFields={['LinkedIn', 'Availability']}
  onComplete={() => router.push('/onboarding/mentor')}
/>
```

---

## 📦 Implementation Checklist

### Phase 1: Setup
- [ ] Create onboarding routes structure
- [ ] Build shared wizard component
- [ ] Create availability selector component
- [ ] Setup form validation schemas (Zod/Yup)

### Phase 2: Mentor Onboarding
- [ ] Build personal info step
- [ ] Build expertise step
- [ ] Build availability step
- [ ] Build review step
- [ ] Connect to database
- [ ] Test complete flow

### Phase 3: Member Onboarding
- [ ] Build personal info step
- [ ] Build program selection step
- [ ] Build availability step
- [ ] Build subscription step (integrate Stripe)
- [ ] Build welcome step
- [ ] Connect to database
- [ ] Test complete flow

### Phase 4: Project Extended Info
- [ ] Build business context form
- [ ] Build resources form
- [ ] Build legal/IP form
- [ ] Build financials form
- [ ] Create project completion banner
- [ ] Connect to database
- [ ] Test complete flow

### Phase 5: Integration
- [ ] Add onboarding triggers (new user signup)
- [ ] Add completion banners to relevant pages
- [ ] Add "Edit Profile" links to modals
- [ ] Add analytics tracking
- [ ] User testing

---

## 🔧 Technical Implementation

### File Structure
```
src/
  pages/
    onboarding/
      mentor/
        personal.tsx
        expertise.tsx
        availability.tsx
        review.tsx
      member/
        personal.tsx
        program.tsx
        availability.tsx
        subscription.tsx
        complete.tsx
      project/
        extended-info.tsx
  components/
    onboarding/
      OnboardingWizard.tsx
      AvailabilitySelector.tsx
      SubscriptionPricingCards.tsx
      ProfileCompletionBanner.tsx
      StepIndicator.tsx
  services/
    onboardingService.ts
  types/
    onboarding.ts
  schemas/
    onboardingSchemas.ts
```

### Sample Service Function
```typescript
// src/services/onboardingService.ts

export const completeMentorOnboarding = async (
  userId: string,
  orgId: string,
  data: MentorOnboardingData
) => {
  // 1. Upload avatar if provided
  let avatarUrl;
  if (data.avatar) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`${userId}/${Date.now()}.jpg`, data.avatar);
    
    if (!uploadError) {
      avatarUrl = supabase.storage.from('avatars').getPublicUrl(uploadData.path).data.publicUrl;
    }
  }

  // 2. Update profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      avatar_url: avatarUrl,
      linkedin_url: data.linkedinUrl,
      website: data.personalWebsite,
    })
    .eq('id', userId);

  if (profileError) throw profileError;

  // 3. Update/create mentor record
  const { error: mentorError } = await supabase
    .from('mentors')
    .upsert({
      user_id: userId,
      organization_id: orgId,
      bio: data.bio,
      expertise: data.expertise,
      availability: data.availability,
      max_projects: data.maxProjects,
      max_entrepreneurs: data.maxEntrepreneurs,
      status: 'active',
    });

  if (mentorError) throw mentorError;

  // 4. Log activity
  await log_user_activity(
    userId,
    orgId,
    'onboarding_completed',
    'Mentor onboarding completed',
    'onboarding',
    null,
    { onboarding_type: 'mentor' }
  );

  return true;
};
```

---

## 🎯 Success Criteria

**Mentor Onboarding:**
- ✅ 100% of required fields collected
- ✅ Avatar uploaded successfully
- ✅ Expertise areas selected
- ✅ Availability defined
- ✅ Profile immediately visible in mentors table

**Member Onboarding:**
- ✅ 100% of required fields collected
- ✅ Program and cohort selected
- ✅ Subscription created and active
- ✅ First payment processed
- ✅ Profile immediately visible in adherents table

**Project Extended Info:**
- ✅ Business context captured
- ✅ Legal and IP status defined
- ✅ Financials (if applicable) recorded
- ✅ Project completeness increased
- ✅ Data visible in projects table

---

## 📊 Analytics to Track

```typescript
// Track onboarding funnel
trackEvent('onboarding_started', {
  type: 'mentor',
  organization_id: orgId
});

trackEvent('onboarding_step_completed', {
  type: 'mentor',
  step: 'personal_info',
  organization_id: orgId
});

trackEvent('onboarding_completed', {
  type: 'mentor',
  organization_id: orgId,
  time_taken_seconds: duration
});

trackEvent('onboarding_abandoned', {
  type: 'mentor',
  last_step: 'expertise',
  organization_id: orgId
});
```

---

**Status:** Ready for Implementation  
**Estimated Time:** 2-3 weeks for all flows  
**Priority Order:** Mentor → Member → Project

