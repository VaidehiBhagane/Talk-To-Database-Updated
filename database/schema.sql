-- Talk to Database - MySQL Schema
-- Created: November 9, 2025

-- Create database
CREATE DATABASE IF NOT EXISTS talk_to_database;
USE talk_to_database;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Business Units table
CREATE TABLE IF NOT EXISTS business_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    schema_name VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Business Unit Access table
CREATE TABLE IF NOT EXISTS user_bu_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bu_id INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bu_id) REFERENCES business_units(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_bu_access (user_id, bu_id),
    INDEX idx_user_id (user_id),
    INDEX idx_bu_id (bu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Query Logs table
CREATE TABLE IF NOT EXISTS query_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bu_id INT NOT NULL,
    query_text TEXT NOT NULL,
    generated_sql TEXT,
    result_count INT DEFAULT 0,
    execution_time FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bu_id) REFERENCES business_units(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_bu_id (bu_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Business Unit Schemas
-- ============================================

-- Sales Department Schema
CREATE DATABASE IF NOT EXISTS sales_dept;
USE sales_dept;

CREATE TABLE IF NOT EXISTS sales_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_date DATE NOT NULL,
    customer_id INT NOT NULL,
    customer_name VARCHAR(100),
    product_id INT NOT NULL,
    product_name VARCHAR(200),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    sales_rep VARCHAR(100),
    region VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (transaction_date),
    INDEX idx_customer (customer_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HR Department Schema
CREATE DATABASE IF NOT EXISTS hr_dept;
USE hr_dept;

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(50),
    position VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(12, 2),
    manager_id INT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status VARCHAR(20),
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_date (attendance_date),
    INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Finance Department Schema
CREATE DATABASE IF NOT EXISTS finance_dept;
USE finance_dept;

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    department VARCHAR(50),
    submitted_by VARCHAR(100),
    approved_by VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (expense_date),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS revenue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    revenue_date DATE NOT NULL,
    source VARCHAR(100),
    amount DECIMAL(12, 2) NOT NULL,
    department VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (revenue_date),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data
-- ============================================

USE talk_to_database;

-- Insert default admin user (password: Admin@123)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@talktodb.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILCn7E.fG', 'admin');

-- Insert sample business units
INSERT INTO business_units (name, description, schema_name, created_by) VALUES
('Sales Department', 'Sales and customer data management', 'sales_dept', 1),
('HR Department', 'Human resources and employee management', 'hr_dept', 1),
('Finance Department', 'Financial data and expense tracking', 'finance_dept', 1);

-- Grant admin access to all business units
INSERT INTO user_bu_access (user_id, bu_id) VALUES
(1, 1),
(1, 2),
(1, 3);

-- Sample sales data
USE sales_dept;

INSERT INTO customers (name, email, phone, city, state, country) VALUES
('Acme Corporation', 'contact@acme.com', '555-0100', 'New York', 'NY', 'USA'),
('Tech Solutions Inc', 'info@techsol.com', '555-0101', 'San Francisco', 'CA', 'USA'),
('Global Traders', 'sales@globaltraders.com', '555-0102', 'Chicago', 'IL', 'USA');

INSERT INTO sales_transactions (transaction_date, customer_id, customer_name, product_id, product_name, quantity, unit_price, total_amount, sales_rep, region) VALUES
('2025-01-15', 1, 'Acme Corporation', 101, 'Premium Software License', 10, 499.99, 4999.90, 'John Smith', 'North'),
('2025-01-16', 2, 'Tech Solutions Inc', 102, 'Cloud Storage Package', 5, 299.99, 1499.95, 'Sarah Johnson', 'West'),
('2025-01-17', 3, 'Global Traders', 103, 'Enterprise Support', 3, 999.99, 2999.97, 'Mike Davis', 'Central'),
('2025-01-18', 1, 'Acme Corporation', 104, 'Analytics Module', 8, 199.99, 1599.92, 'John Smith', 'North'),
('2025-01-19', 2, 'Tech Solutions Inc', 101, 'Premium Software License', 15, 499.99, 7499.85, 'Sarah Johnson', 'West');

-- Sample HR data
USE hr_dept;

INSERT INTO employees (employee_code, first_name, last_name, email, phone, department, position, hire_date, salary, status) VALUES
('EMP001', 'John', 'Smith', 'john.smith@company.com', '555-1001', 'Sales', 'Sales Manager', '2020-01-15', 85000.00, 'active'),
('EMP002', 'Sarah', 'Johnson', 'sarah.johnson@company.com', '555-1002', 'Sales', 'Sales Representative', '2021-03-10', 65000.00, 'active'),
('EMP003', 'Mike', 'Davis', 'mike.davis@company.com', '555-1003', 'Sales', 'Sales Representative', '2021-06-20', 65000.00, 'active'),
('EMP004', 'Emily', 'Brown', 'emily.brown@company.com', '555-1004', 'HR', 'HR Manager', '2019-08-01', 80000.00, 'active'),
('EMP005', 'David', 'Wilson', 'david.wilson@company.com', '555-1005', 'Finance', 'Finance Manager', '2020-02-15', 90000.00, 'active');

-- Sample Finance data
USE finance_dept;

INSERT INTO expenses (expense_date, category, description, amount, department, submitted_by, approved_by, status) VALUES
('2025-01-10', 'Marketing', 'Q1 Marketing Campaign', 15000.00, 'Marketing', 'Jane Doe', 'David Wilson', 'approved'),
('2025-01-12', 'IT', 'Software Licenses', 8500.00, 'IT', 'Tech Team', 'David Wilson', 'approved'),
('2025-01-15', 'Office', 'Office Supplies', 1200.00, 'Administration', 'Admin Staff', 'David Wilson', 'approved'),
('2025-01-18', 'Travel', 'Client Meeting Travel', 3500.00, 'Sales', 'John Smith', NULL, 'pending');

INSERT INTO revenue (revenue_date, source, amount, department, notes) VALUES
('2025-01-15', 'Software Sales', 50000.00, 'Sales', 'Q1 Software licenses'),
('2025-01-20', 'Consulting Services', 35000.00, 'Consulting', 'Enterprise consulting project'),
('2025-01-25', 'Support Contracts', 25000.00, 'Support', 'Annual support renewals');

-- ============================================
-- Completion Message
-- ============================================
SELECT 'Database schema created successfully!' as message;
