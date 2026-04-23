# Project Tab Architecture

## Current implementation

The live project workspace now supports **company-configurable project tabs**.

Project pages resolve tab settings from the company record using this priority:

1. `companies.project_tab_settings`
2. `companies.project_tabs`
3. `companies.settings.project_tabs`
4. `companies.custom_terminology.project_tabs`
5. fallback to default available tab types in code

Each tab config item can provide:

```json
{
  "key": "daily-reports",
  "label": "Field Reports",
  "enabled": true,
  "order": 8
}
```

Current available tab types include:
- `job-progress`
- `811-tracking`
- `materials`
- `map-progress`
- `safety-meetings`
- `permits`
- `blueprints`
- `voice-notes`
- `equipment`
- `vehicles`
- `daily-reports`
- `reports`

This allows a company to:
- enable or disable a tab
- rename a tab label
- reorder tabs
- keep all tab visibility scoped to that company only

Projects still enforce:
- `company_id` isolation
- `project_id` isolation on project-specific records

## Recommended normalized database design

For long-term scalability, use these tables:

### `project_tab_types`
Global registry of available tab types.

Suggested columns:
- `key` unique
- `default_label`
- `route_segment`
- `description`
- `icon_name`
- `is_system`
- `is_active`
- `created_at`
- `updated_at`

### `company_project_tabs`
Company-specific configuration for each available project tab type.

Suggested columns:
- `id`
- `company_id`
- `project_tab_type_key`
- `display_label`
- `is_enabled`
- `sort_order`
- `settings_json`
- `created_at`
- `updated_at`

Suggested constraint:
- unique `(company_id, project_tab_type_key)`

### Future optional table: `project_tab_records`
Only if you later want a shared activity/audit layer for tab modules.

Suggested columns:
- `id`
- `company_id`
- `project_id`
- `project_tab_type_key`
- `record_type`
- `record_id`
- `created_at`
- `created_by`

## Recommended equipment and vehicle operations tables

To support project-level reporting, wear tracking, inspections, and maintenance alerts,
add these tables next.

### `project_equipment_assignments`
Links equipment to a project over a date range.

Suggested columns:
- `id`
- `company_id`
- `project_id`
- `equipment_id`
- `assigned_start_date`
- `assigned_end_date`
- `status`
- `notes`
- `created_at`
- `updated_at`

### `project_vehicle_assignments`
Links vehicles to a project over a date range.

Suggested columns:
- `id`
- `company_id`
- `project_id`
- `vehicle_id`
- `assigned_start_date`
- `assigned_end_date`
- `status`
- `notes`
- `created_at`
- `updated_at`

### `equipment_usage_logs`
Project-specific usage and wear tracking for equipment.

Suggested columns:
- `id`
- `company_id`
- `project_id`
- `equipment_id`
- `usage_date`
- `operator_name`
- `meter_start`
- `meter_end`
- `usage_amount`
- `fuel_used`
- `condition_notes`
- `needs_service`
- `created_at`
- `updated_at`

### `vehicle_usage_logs`
Project-specific vehicle usage records.

Suggested columns:
- `id`
- `company_id`
- `project_id`
- `vehicle_id`
- `usage_date`
- `driver_name`
- `odometer_start`
- `odometer_end`
- `miles_driven`
- `fuel_added`
- `fuel_cost`
- `condition_notes`
- `needs_service`
- `created_at`
- `updated_at`

### `equipment_inspections`
Inspection checklist records for equipment.

Suggested columns:
- `id`
- `company_id`
- `project_id`
- `equipment_id`
- `inspection_date`
- `inspected_by`
- `inspection_type`
- `status`
- `findings`
- `attachments`
- `created_at`
- `updated_at`

### `vehicle_inspections`
Inspection checklist records for vehicles.

Suggested columns:
- `id`
- `company_id`
- `project_id`
- `vehicle_id`
- `inspection_date`
- `inspected_by`
- `inspection_type`
- `status`
- `findings`
- `attachments`
- `created_at`
- `updated_at`

### `asset_maintenance_schedules`
Shared maintenance rule table for either equipment or vehicles.

Suggested columns:
- `id`
- `company_id`
- `asset_type` (`equipment` or `vehicle`)
- `asset_id`
- `service_type`
- `interval_days`
- `interval_usage`
- `last_service_date`
- `last_service_meter`
- `next_due_date`
- `next_due_meter`
- `is_active`
- `notes`
- `created_at`
- `updated_at`

Examples of `service_type`:
- oil change
- hydraulic fluid change
- coolant service
- tire rotation
- track replacement
- track service
- filter change

### `asset_maintenance_events`
Completed maintenance and repair history.

Suggested columns:
- `id`
- `company_id`
- `asset_type`
- `asset_id`
- `project_id` nullable
- `service_type`
- `service_date`
- `meter_reading`
- `vendor`
- `cost`
- `notes`
- `attachments`
- `created_at`
- `updated_at`

### `asset_maintenance_alerts`
Computed or stored alert records for due or overdue service.

Suggested columns:
- `id`
- `company_id`
- `asset_type`
- `asset_id`
- `maintenance_schedule_id`
- `project_id` nullable
- `alert_status`
- `message`
- `due_date`
- `due_meter`
- `resolved_at`
- `created_at`
- `updated_at`

## Why this design is best

- global tab types stay centralized
- each company controls its own labels, order, and visibility
- new tab types can be added without schema churn in project records
- project UI can render from config without hard-coding every company setup
- project data remains tied to both `company_id` and `project_id`
- equipment and vehicles can be tracked both as company assets and as project-specific operational records
- maintenance alerts can be calculated from date-based or usage-based service intervals

## Suggested migration path

1. Keep the current company JSON config as a working bridge.
2. Add `project_tab_types`.
3. Add `company_project_tabs`.
4. Backfill current company JSON configs into `company_project_tabs`.
5. Update the admin settings UI to write to `company_project_tabs`.
6. Retire the JSON fallback after all companies are migrated.
