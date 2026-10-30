-- ─── companies ───────────────────────────────────────────────────────────────
CREATE TABLE companies (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    legal_name  VARCHAR(255),
    tax_number  VARCHAR(100),
    email       VARCHAR(255),
    phone       VARCHAR(50),
    address     TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_companies
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── branches ────────────────────────────────────────────────────────────────
CREATE TABLE branches (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(50) UNIQUE NOT NULL,
    address     TEXT,
    city        VARCHAR(100),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_branches
    BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── departments ─────────────────────────────────────────────────────────────
CREATE TABLE departments (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id           UUID REFERENCES companies(id) ON DELETE CASCADE,
    branch_id            UUID REFERENCES branches(id) ON DELETE SET NULL,
    parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name                 VARCHAR(255) NOT NULL,
    code                 VARCHAR(50) UNIQUE NOT NULL,
    description          TEXT,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_departments
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── divisions ───────────────────────────────────────────────────────────────
CREATE TABLE divisions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name          VARCHAR(255) NOT NULL,
    code          VARCHAR(50),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_divisions
    BEFORE UPDATE ON divisions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── job_grades ──────────────────────────────────────────────────────────────
CREATE TABLE job_grades (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    level       INTEGER NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_job_grades
    BEFORE UPDATE ON job_grades
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── positions ───────────────────────────────────────────────────────────────
CREATE TABLE positions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    job_grade_id  UUID REFERENCES job_grades(id) ON DELETE SET NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_positions
    BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Indexes for performance
CREATE INDEX idx_branches_company_id ON branches(company_id);
CREATE INDEX idx_departments_company_id ON departments(company_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_department_id);
CREATE INDEX idx_divisions_department_id ON divisions(department_id);
CREATE INDEX idx_positions_department_id ON positions(department_id);
CREATE INDEX idx_positions_job_grade_id ON positions(job_grade_id);

