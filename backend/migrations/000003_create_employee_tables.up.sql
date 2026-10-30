-- ─── employees ─────────────────────────────────────────────────────────────
CREATE TABLE employees (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID REFERENCES users(id) ON DELETE SET NULL UNIQUE,
    employee_number   VARCHAR(50) UNIQUE NOT NULL,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100),
    email             VARCHAR(255) UNIQUE NOT NULL,
    phone             VARCHAR(50),
    gender            VARCHAR(20),
    birth_date        DATE,
    birth_place       VARCHAR(100),
    national_id       VARCHAR(50) UNIQUE,
    marital_status    VARCHAR(50),
    employment_type   VARCHAR(50) NOT NULL DEFAULT 'permanent',
    employment_status VARCHAR(50) NOT NULL DEFAULT 'active',
    department_id     UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id       UUID REFERENCES positions(id) ON DELETE SET NULL,
    manager_id        UUID REFERENCES employees(id) ON DELETE SET NULL,
    join_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    termination_date  DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_employees
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── employee_contacts ─────────────────────────────────────────────────────
CREATE TABLE employee_contacts (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contact_type  VARCHAR(50) NOT NULL,
    contact_value VARCHAR(255) NOT NULL,
    is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── employee_addresses ────────────────────────────────────────────────────
CREATE TABLE employee_addresses (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    address_type  VARCHAR(50) NOT NULL DEFAULT 'primary',
    street        TEXT NOT NULL,
    city          VARCHAR(100),
    province      VARCHAR(100),
    postal_code   VARCHAR(20),
    country       VARCHAR(100) DEFAULT 'Indonesia',
    is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── employee_emergency_contacts ───────────────────────────────────────────
CREATE TABLE employee_emergency_contacts (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name         VARCHAR(150) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    address      TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── employee_bank_accounts ────────────────────────────────────────────────
CREATE TABLE employee_bank_accounts (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id    UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    bank_name      VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_holder VARCHAR(150) NOT NULL,
    is_primary     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── employee_employment_histories ─────────────────────────────────────────
CREATE TABLE employee_employment_histories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id     UUID REFERENCES positions(id) ON DELETE SET NULL,
    manager_id      UUID REFERENCES employees(id) ON DELETE SET NULL,
    effective_from  DATE NOT NULL,
    effective_until DATE,
    change_reason   VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_position_id ON employees(position_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_number ON employees(employee_number);
CREATE INDEX idx_emp_contacts_emp_id ON employee_contacts(employee_id);
CREATE INDEX idx_emp_addresses_emp_id ON employee_addresses(employee_id);
CREATE INDEX idx_emp_emergency_emp_id ON employee_emergency_contacts(employee_id);
CREATE INDEX idx_emp_banks_emp_id ON employee_bank_accounts(employee_id);
CREATE INDEX idx_emp_histories_emp_id ON employee_employment_histories(employee_id);

