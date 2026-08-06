# 03-Shared — Canonical Entity Model (docs/03-Shared/EntityModel.md)

> **Status**: Frozen Canonical Model  
> **Rule**: Canonical entities exist ONCE as shared platform assets consumed across all Product OS Suites.

---

## 1. Company Intelligence Entity (`Company`)

Shared across **Recruitment OS**, **Revenue OS**, **Executive OS**, **Customer Success OS**, and **Knowledge OS**.

### Data Fields
- `id`: UUID (Primary Key)
- `workspace_id`: UUID (Tenant Isolation)
- `name`: String
- `domain`: String (e.g. `techcorp.com`)
- `industry`: String
- `hiring_velocity`: Number (Open jobs per month)
- `active_positions_count`: Number
- `total_placements_count`: Number
- `bill_rate_average`: Currency
- `payment_behavior`: Enum (`Exemplary`, `Standard`, `Delayed`, `High Risk`)
- `invoice_ageing_avg_days`: Number
- `tech_stack`: Array of Strings
- `ai_company_summary`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

---

## 2. Candidate Entity (`Candidate`)

Shared across **Recruitment OS**, **Knowledge OS**, and **Executive OS**.

### Data Fields
- `id`: UUID (Primary Key)
- `workspace_id`: UUID
- `full_name`: String
- `email`: String
- `phone`: String
- `current_title`: String
- `years_experience`: Number
- `skills`: Array of Strings
- `resume_url`: String
- `status`: Enum (`Available`, `In Pipeline`, `Placed`, `Inactive`)
- `created_at`: Timestamp

---

## 3. Job Entity (`Job`)

Shared across **Recruitment OS**, **Revenue OS**, and **Growth OS**.

### Data Fields
- `id`: UUID (Primary Key)
- `workspace_id`: UUID
- `company_id`: UUID (Foreign Key to `Company`)
- `title`: String
- `department`: String
- `requirements`: Array of Strings
- `target_salary_min`: Currency
- `target_salary_max`: Currency
- `status`: Enum (`Open`, `In Interview`, `Filled`, `Cancelled`)
- `created_at`: Timestamp
