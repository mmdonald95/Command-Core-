# Multi-Tenant SaaS Architecture Guide

This document describes the multi-tenant architecture implemented for Precision Pipeline as a public App Store application.

## Overview

The app has been converted from a single-company system to a true multi-tenant SaaS platform where:
- Multiple companies can create workspaces
- Users belong to companies
- All data is strictly isolated by company_id
- The app can be distributed on public app stores

## Key Components

### 1. Company Entity (`entities/Company.json`)

Every workspace is a `Company` record with:
- `name` - Company display name
- `code` - Unique identifier (e.g., "ppdms") used in login
- `industry_type` - Classification for UI customization
- `logo_url` - Custom company branding
- `custom_terminology` - Customizable field names (Project, Task, etc.)
- `subscription_plan` - Tier (free, pro, enterprise)
- `is_demo` - Flag for demo accounts
- `brand_primary_color`, `brand_secondary_color` - Custom colors

### 2. User-Company Relationship

The `User` entity has been updated to include:
- `company_id` - Reference to the Company workspace
- `role` - Role within that company (super_admin, admin, manager, field_user)
- `is_active` - Account status

**Important:** Users are assigned to exactly one company. Multi-company support requires a separate `UserCompany` join table.

### 3. Data Isolation

All existing entities (Project, Task, Crew, etc.) now require:
- `company_id` field to be added to their schema
- Queries must filter by `company_id`

**Example query with isolation:**
```javascript
const projects = await base44.entities.Project.filter({
  company_id: userCompanyId,
});
```

## Authentication Flow

### Normal Login
1. User provides: Company Code + Email + Password
2. System finds company by code
3. User is authenticated
4. Company is set in localStorage
5. User redirected to Dashboard with that company's data

### Company Selector
After login, if user doesn't have a `company_id`:
- Redirected to `/CompanySelector`
- Can select existing company or create new one
- Once selected, `company_id` is saved to user record

### Demo Mode
- Route: `/DemoMode`
- Automatically creates demo company with sample data
- Users can explore full features without restrictions
- Perfect for App Review testing

### Onboarding Flow
- Route: `/Onboarding`
- New users create company and set up workspace
- Two-step process: company details → logo upload
- Automatically assigns user as company admin

## Implementation Details

### Hooks for Company Data Access

**`useCompanyData(entityName, filter, options)`**
- Automatically filters by user's company_id
- Prevents cross-company data leaks
- Example:
```javascript
const { data: projects } = useCompanyData('Project', { status: 'active' });
```

**`useCompanyEntity(entityName, entityId, options)`**
- Fetches single entity with ownership verification
- Throws error if company_id doesn't match

### Creating Entities with Company Context

When creating new records:
```javascript
await base44.entities.Project.create({
  ...projectData,
  company_id: userCompanyId,  // ALWAYS include this
});
```

## Migrating Existing Data

### Setup Default Company

A backend function `setupDefaultCompany` exists to:
1. Create a default "Precision Pipeline and Drilling, LLC" company
2. Assign all existing users to it
3. Preserve all legacy data

**To run migration:**
```javascript
const response = await base44.functions.invoke('setupDefaultCompany', {});
```

## Default Company

For the current PPD deployment:
- **Company Code:** `ppdms`
- **Name:** Precision Pipeline and Drilling, LLC
- **Industry:** Pipeline
- **Plan:** Pro (unlimited users)

All existing users and data are migrated to this company.

## Role-Based Access Control

### Roles Within a Company
- **super_admin** - Platform-level (can create companies)
- **admin** - Company admin (can manage users, settings)
- **manager** - Department/project manager
- **field_user** - Crew/field workers

**Note:** In the current implementation, roles are per-company. Platform-wide role checks are done via `user.role === 'super_admin'`.

## Pages & Routes

### Public Routes (No Auth Required)
- `/` - Main dashboard (redirects based on auth)
- `/CompanySelector` - Select or create company
- `/Onboarding` - Create new company
- `/DemoMode` - Demo account setup

### Protected Routes (Auth + Company Required)
- All other routes via the Layout component
- Automatically enforce company_id in data queries

## Configuration by Industry

The `industry_type` field enables UI customization:
- Different terminology
- Custom workflows/statuses
- Industry-specific forms
- Different feature sets by plan

Example terminology customization:
```javascript
const terminology = company.custom_terminology;
// { project_term: "Project", task_term: "Task", ... }
```

## Future Enhancements

1. **Multi-Company Users** - Allow users to belong to multiple companies via UserCompany join table
2. **SSO Integration** - OAuth providers per company
3. **API Keys** - Company-specific API access
4. **Usage Metering** - Track usage per company for billing
5. **Custom Branding** - Full white-label support
6. **Invite System** - Send invites to join companies
7. **Audit Logging** - Track changes per company

## Security Considerations

1. **Always filter by company_id** - Never query without company filter
2. **Verify ownership before updates** - Check company_id matches user's
3. **Frontend enforcement** - Use hooks that enforce company_id
4. **Backend validation** - Implement RLS rules per entity
5. **Separate demo data** - Don't expose real data in demo mode

## Troubleshooting

### User Redirected to CompanySelector
- User record missing `company_id`
- Run assignment or ask user to select company

### Can't See Data After Login
- Check `userCompanyId` is set in AuthContext
- Verify entity queries include company_id filter
- Check browser localStorage for `selected_company_id`

### Data from Wrong Company Visible
- Audit all entity queries for company_id filter
- Check useCompanyData hook usage
- Verify RLS rules on backend entities

## Testing

To test multi-tenancy:

1. **Create demo company** - `/DemoMode` shows full flow
2. **Create real company** - `/Onboarding` then `/Dashboard`
3. **Multiple users** - Create users in different companies
4. **Verify isolation** - Confirm users only see their company's data

## References

- `CompanyContext.jsx` - Company state management
- `useCompanyData.js` - Data isolation hooks
- `setupDefaultCompany.js` - Migration function
- Entity schemas updated with company_id fields