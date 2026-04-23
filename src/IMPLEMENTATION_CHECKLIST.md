# Multi-Tenant Implementation Checklist

## ✅ COMPLETED

### Core Infrastructure
- [x] Created `Company` entity with all configuration fields
- [x] Updated `User` entity with `company_id` and role fields
- [x] Created `CompanyContext` for company state management
- [x] Created `useCompanyData` hooks for data isolation
- [x] Updated `AuthContext` to enforce company assignment

### Pages & Flows
- [x] Created `/CompanySelector` - Select or create company
- [x] Created `/Onboarding` - Multi-step company setup
- [x] Created `/DemoMode` - Demo account with sample data
- [x] Updated `Projects` page with company-based filtering
- [x] Added routes to `App.jsx` for all new pages

### Backend Functions
- [x] Created `setupDefaultCompany` function for migration

### Documentation
- [x] Created `MULTI_TENANT_GUIDE.md` with architecture overview
- [x] Created this checklist

## 🔄 NEXT STEPS - TO COMPLETE THE MIGRATION

### 1. Update All Entity Schemas (HIGH PRIORITY)

Add `company_id` field to ALL entities that should be company-scoped:

```json
{
  "company_id": {
    "type": "string",
    "description": "Reference to Company (tenant)"
  }
}
```

**Entities to update:**
- [x] Project - Add `company_id`
- [ ] Task - Add `company_id`
- [ ] CrewMember - Add `company_id`
- [ ] CrewAssignment - Add `company_id`
- [ ] Equipment - Add `company_id`
- [ ] EquipmentInspection - Add `company_id`
- [ ] EquipmentLog - Add `company_id`
- [ ] Vehicle - Add `company_id`
- [ ] VehicleInspection - Add `company_id`
- [ ] VehicleLog - Add `company_id`
- [ ] Expense - Add `company_id` (already has RLS)
- [ ] IncidentReport - Add `company_id`
- [ ] MaterialLog - Add `company_id`
- [ ] PhotoLog - Add `company_id`
- [ ] Ticket811 - Add `company_id`
- [ ] DailyReport - Add `company_id`
- [ ] SafetyMeeting - Add `company_id`
- [ ] VoiceNote - Add `company_id`
- [ ] CheckIn - Add `company_id`
- [ ] InventoryItem - Add `company_id`
- [ ] InventoryTransaction - Add `company_id` (if exists)
- [ ] TimeCard - Add `company_id` (if exists)
- [ ] MapComment - Add `company_id` (if exists)
- [ ] MapTask - Add `company_id` (if exists)
- [ ] Message - Add `company_id` (if exists)
- [ ] Milestone - Add `company_id` (if exists)
- [ ] EquipmentRental - Add `company_id` (if exists)
- [ ] TrailerInspection - Add `company_id`

### 2. Update All Page Queries (HIGH PRIORITY)

Update every page that fetches data to include company filter:

**Pattern to follow:**
```javascript
const { userCompanyId } = useAuth();

const { data } = useQuery({
  queryKey: ['entityName', userCompanyId],
  queryFn: () => base44.entities.EntityName.filter({ 
    company_id: userCompanyId 
  }),
  enabled: !!userCompanyId,
});
```

**Pages to update:**
- Dashboard - Filter crew, projects, time cards
- Projects - ✅ Already updated
- Crew - Filter by company
- TimeCards - Filter by company
- TimeApproval - Filter by company
- Payroll - Filter by company
- Reports - Filter by company
- DailyReports - Filter by company
- SafetyMeetings - Filter by company
- ReceiptUploads - Filter by company
- Expenses - Filter by company
- Users - Filter by company (list team members)
- MyProfile - Load current user's profile
- MaterialUsageReport - Filter materials by company
- ProjectDetails - Fetch project with company check

### 3. Update All Create Operations (HIGH PRIORITY)

When creating entities, always include company_id:

```javascript
const createMutation = useMutation({
  mutationFn: (data) => base44.entities.EntityName.create({
    ...data,
    company_id: userCompanyId,  // ← ADD THIS
  }),
});
```

**Files to update:**
- All dialog components that create entities
- All form components
- All bulk import functions

### 4. Update Components (MEDIUM PRIORITY)

- [ ] Update CreateProjectDialog to include company_id
- [ ] Update ProjectDetailsPage to verify company ownership
- [ ] Update all entity dialogs (crew, equipment, etc.)
- [ ] Add company context to terminology display
- [ ] Show company logo and name in header
- [ ] Update layout to display active company

### 5. Implement Row-Level Security (RLS) (MEDIUM PRIORITY)

Add RLS rules to entities to prevent direct API abuse:

```json
{
  "rls": {
    "create": {
      "user_condition": {
        "data.company_id": "{{user.company_id}}"
      }
    },
    "read": {
      "user_condition": {
        "company_id": "{{user.company_id}}"
      }
    },
    "update": {
      "user_condition": {
        "company_id": "{{user.company_id}}"
      }
    },
    "delete": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}
```

**Entities to secure (start with top 5):**
1. Project
2. Task
3. CrewMember
4. Equipment
5. DailyReport

### 6. Test Migration Function (MEDIUM PRIORITY)

- [ ] Call `setupDefaultCompany` function to migrate existing users
- [ ] Verify all existing data is assigned to PPD company
- [ ] Test login flow with company code
- [ ] Test demo mode creates proper sample data

### 7. Update Backend Functions (MEDIUM PRIORITY)

Review all backend functions in `functions/` and:
- [ ] Add company_id parameter when needed
- [ ] Verify company ownership before operating
- [ ] Filter results by company_id
- [ ] Document company requirements

**Key functions to update:**
- `sendDailyReportEmail` - Filter by company
- `syncTaskInventory` - Filter by company
- `updateDailyReportsInventory` - Filter by company
- `seedInventory` - Filter by company
- `importBOM` - Filter by company
- All custom functions

### 8. Update Demo Data Setup (MEDIUM PRIORITY)

- [ ] Expand DemoMode page to create sample crew members
- [ ] Add sample tasks with progress
- [ ] Add sample equipment and vehicles
- [ ] Add sample daily report
- [ ] Create realistic demo workflow

### 9. Public App Store Compliance (HIGH PRIORITY)

- [ ] Remove hardcoded "Precision Pipeline" references where possible
- [ ] Allow customization of company name everywhere
- [ ] Test signup → create company → use app flow
- [ ] Verify Apple/Google login works properly
- [ ] Test demo mode is accessible without account
- [ ] Remove any company-specific graphics or branding (use logos from Company)
- [ ] Update app description to reflect multi-tenancy

### 10. Testing (HIGH PRIORITY)

- [ ] Test user login with company code
- [ ] Test creating new company via onboarding
- [ ] Test demo mode end-to-end
- [ ] Test data isolation (different users can't see each other's data)
- [ ] Test permissions per role
- [ ] Test company switching if implemented
- [ ] Test API security with RLS rules
- [ ] Performance test with multiple companies/users

### 11. Documentation (LOW PRIORITY)

- [ ] Update app description for App Store
- [ ] Create user guide for company admin
- [ ] Document company setup process
- [ ] Document team member invitation (when implemented)
- [ ] Document custom terminology setup

## 🚀 DEPLOYMENT STEPS

1. **Update entities** - Add company_id to all schemas
2. **Deploy migrations** - Run setupDefaultCompany
3. **Update pages** - Implement company filtering
4. **Add RLS rules** - Secure entities at backend
5. **Test thoroughly** - Verify isolation and permissions
6. **Deploy to staging** - Test with real workflow
7. **Submit to App Store** - With updated description

## 📊 Progress Tracker

- Foundation: **100%** ✅
- Core Pages: **30%** (Projects done, others need company_id)
- Entity Updates: **5%** (Company/User done, 25 more to go)
- Data Isolation: **20%** (Context ready, queries need updates)
- RLS Rules: **0%**
- Testing: **0%**
- Documentation: **50%**

## Important Notes

1. **Must add `company_id` to ALL data entities** - This is the core of multi-tenancy
2. **Every query must filter by company_id** - Use the useCompanyData hook
3. **Every create must include company_id** - Prevent cross-company data
4. **Test thoroughly** - Data isolation is critical for security
5. **Consider performance** - May need indexes on company_id queries

## Questions/Blockers

- How to handle users who need access to multiple companies? (Requires UserCompany table)
- Should demo mode have editable features or read-only? (Currently editable)
- Do you want team member invitation? (Requires additional workflow)
- Should reports be company-scoped? (Yes, recommended)

---

**Last Updated:** 2026-04-15
**Status:** Foundation Complete, Implementation In Progress