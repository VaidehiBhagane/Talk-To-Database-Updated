-- Talk to Database - MySQL Schema (FINAL UPDATED)
-- Created: November 9, 2025
-- Updated: November 12, 2025
-- Expanded: December 5, 2025

-- NOTE: If you want to start fresh, uncomment the lines below to drop existing databases
-- WARNING: This will delete all existing data!
-- DROP DATABASE IF EXISTS talk_to_database;
-- DROP DATABASE IF EXISTS sales_dept;
-- DROP DATABASE IF EXISTS hr_dept;
-- DROP DATABASE IF EXISTS finance_dept;

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
    profile_picture LONGTEXT NULL,
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

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_user_id INT,
    related_bu_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_bu_id) REFERENCES business_units(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (notification_type),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Access Requests table
CREATE TABLE IF NOT EXISTS access_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bu_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bu_id) REFERENCES business_units(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_bu_id (bu_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
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
INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@talktodb.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILCn7E.fG', 'admin');

-- Insert 12 Business Units
INSERT IGNORE INTO business_units (name, description, schema_name, created_by) VALUES
('Sales Department', 'Sales and customer data management', 'sales_dept', 1),
('HR Department', 'Human resources and employee management', 'hr_dept', 1),
('Finance Department', 'Financial data and expense tracking', 'finance_dept', 1),
('Marketing Department', 'Marketing operations, campaigns, branding', 'marketing_dept', 1),
('IT Department', 'IT infrastructure, networks, systems and tools', 'it_dept', 1),
('Operations Department', 'Daily operational workflows and logistics', 'operations_dept', 1),
('Customer Success', 'Customer onboarding, retention and support', 'cs_dept', 1),
('Product Management', 'Product planning, roadmap & development insights', 'product_dept', 1),
('Legal Department', 'Compliance, legal operations and contract tracking', 'legal_dept', 1),
('Procurement Department', 'Vendor management and purchasing operations', 'procurement_dept', 1),
('Research & Development', 'Innovation, research pipelines and analysis', 'rnd_dept', 1),
('Support Department', 'Technical support and issue resolution', 'support_dept', 1);


-- Grant admin access to all 12 business units
INSERT IGNORE INTO user_bu_access (user_id, bu_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 5),
(1, 7),
(1, 9),
(1, 12),

(2, 1),
(2, 4),
(2, 8),

(3, 2),
(3, 6),
(3, 11),

(4, 3),
(4, 5),

(5, 7),
(5, 10),

(6, 4),
(6, 9),

(7, 6),

(8, 8),
(8, 12),

(9, 2),

(10, 11),

(11, 3),

(12, 1);


-- Sample sales data
USE sales_dept;

INSERT IGNORE INTO customers (name, email, phone, city, state, country) VALUES
('Acme Corporation', 'contact@acme.com', '555-0100', 'New York', 'NY', 'USA'),
('Tech Solutions Inc', 'info@techsol.com', '555-0101', 'San Francisco', 'CA', 'USA'),
('Global Traders', 'sales@globaltraders.com', '555-0102', 'Chicago', 'IL', 'USA'),
('BlueWave Industries', 'info@bluewave.com', '555-0103', 'Seattle', 'WA', 'USA'),
('Prime Logistics', 'support@primelogistics.com', '555-0104', 'Houston', 'TX', 'USA'),
('NextGen Software', 'hello@nextgensoft.com', '555-0105', 'Boston', 'MA', 'USA'),
('Urban Retail Corp', 'contact@urbanretail.com', '555-0106', 'Los Angeles', 'CA', 'USA'),
('NorthStar Electronics', 'support@northstar.com', '555-0107', 'Denver', 'CO', 'USA'),
('Summit Healthcare', 'info@summithealth.com', '555-0108', 'Phoenix', 'AZ', 'USA'),
('Evergreen Foods', 'sales@evergreenfoods.com', '555-0109', 'Portland', 'OR', 'USA'),
('Pioneer Energy Group', 'contact@pioneerenergy.com', '555-0110', 'Dallas', 'TX', 'USA'),
('Velocity Motors', 'info@velocitymotors.com', '555-0111', 'Detroit', 'MI', 'USA'),
('BrightStart Education', 'admin@brightstartedu.com', '555-0112', 'Atlanta', 'GA', 'USA'),
('Silverline Finance', 'support@silverlinefin.com', '555-0113', 'New York', 'NY', 'USA'),
('RedRock Construction', 'contact@redrockbuild.com', '555-0114', 'Las Vegas', 'NV', 'USA'),
('InnoTech Labs', 'info@innotechlabs.com', '555-0115', 'San Diego', 'CA', 'USA'),
('FutureCom Networks', 'support@futurecom.com', '555-0116', 'Miami', 'FL', 'USA'),
('Apex Hardware Supplies', 'sales@apexhardware.com', '555-0117', 'Cleveland', 'OH', 'USA'),
('MountainPeak Apparel', 'info@mountainpeak.com', '555-0118', 'Salt Lake City', 'UT', 'USA'),
('GreenLeaf Organics', 'hello@greenleaf.com', '555-0119', 'Portland', 'OR', 'USA'),
('Starline Aviation', 'contact@starlineaviation.com', '555-0120', 'Charlotte', 'NC', 'USA'),
('BrightWave Media', 'support@brightwavemedia.com', '555-0121', 'Los Angeles', 'CA', 'USA'),
('OceanGate Shipping', 'info@oceangate.com', '555-0122', 'Jacksonville', 'FL', 'USA'),
('CloudCore Systems', 'contact@cloudcore.com', '555-0123', 'Austin', 'TX', 'USA'),
('GoldenLeaf Furniture', 'support@goldenleaf.com', '555-0124', 'Minneapolis', 'MN', 'USA');


INSERT IGNORE INTO sales_transactions 
(transaction_date, customer_id, customer_name, product_id, product_name, quantity, unit_price, total_amount, sales_rep, region) 
VALUES
('2025-01-15', 1, 'Acme Corporation', 101, 'Premium Software License', 10, 499.99, 4999.90, 'John Smith', 'North'),
('2025-01-16', 2, 'Tech Solutions Inc', 102, 'Cloud Storage Package', 5, 299.99, 1499.95, 'Sarah Johnson', 'West'),
('2025-01-17', 3, 'Global Traders', 103, 'Enterprise Support', 3, 999.99, 2999.97, 'Mike Davis', 'Central'),
('2025-01-18', 1, 'Acme Corporation', 104, 'Analytics Module', 8, 199.99, 1599.92, 'John Smith', 'North'),
('2025-01-19', 2, 'Tech Solutions Inc', 101, 'Premium Software License', 15, 499.99, 7499.85, 'Sarah Johnson', 'West'),

('2025-01-20', 4, 'BlueWave Industries', 105, 'Enterprise Support', 4, 799.99, 3199.96, 'Emily Brown', 'West'),
('2025-01-21', 5, 'Prime Logistics', 106, 'Analytics Module', 6, 249.99, 1499.94, 'David Wilson', 'South'),
('2025-01-22', 6, 'NextGen Software', 101, 'Premium Software License', 12, 499.99, 5999.88, 'John Smith', 'East'),
('2025-01-23', 7, 'Urban Retail Corp', 103, 'Enterprise Support', 2, 999.99, 1999.98, 'Sarah Johnson', 'West'),
('2025-01-24', 8, 'NorthStar Electronics', 104, 'Analytics Module', 7, 199.99, 1399.93, 'Mike Davis', 'Central'),

('2025-01-25', 9, 'Summit Healthcare', 102, 'Cloud Storage Package', 9, 299.99, 2699.91, 'Emily Brown', 'South'),
('2025-01-26', 10, 'Evergreen Foods', 105, 'Enterprise Support', 3, 799.99, 2399.97, 'David Wilson', 'East'),
('2025-01-27', 11, 'Pioneer Energy Group', 101, 'Premium Software License', 4, 499.99, 1999.96, 'John Smith', 'North'),
('2025-01-28', 12, 'Velocity Motors', 106, 'Analytics Module', 5, 249.99, 1249.95, 'Sarah Johnson', 'Central'),
('2025-01-29', 13, 'BrightStart Education', 102, 'Cloud Storage Package', 6, 299.99, 1799.94, 'Mike Davis', 'West'),

('2025-01-30', 14, 'Silverline Finance', 104, 'Analytics Module', 8, 199.99, 1599.92, 'Emily Brown', 'North'),
('2025-01-31', 15, 'RedRock Construction', 103, 'Enterprise Support', 2, 999.99, 1999.98, 'John Smith', 'South'),
('2025-02-01', 16, 'InnoTech Labs', 101, 'Premium Software License', 9, 499.99, 4499.91, 'Sarah Johnson', 'East'),
('2025-02-02', 17, 'FutureCom Networks', 102, 'Cloud Storage Package', 4, 299.99, 1199.96, 'Mike Davis', 'West'),
('2025-02-03', 18, 'Apex Hardware Supplies', 105, 'Enterprise Support', 7, 799.99, 5599.93, 'Emily Brown', 'Central'),

('2025-02-04', 19, 'MountainPeak Apparel', 106, 'Analytics Module', 10, 249.99, 2499.90, 'David Wilson', 'West'),
('2025-02-05', 20, 'GreenLeaf Organics', 102, 'Cloud Storage Package', 8, 299.99, 2399.92, 'Sarah Johnson', 'East'),
('2025-02-06', 21, 'Starline Aviation', 101, 'Premium Software License', 5, 499.99, 2499.95, 'John Smith', 'South'),
('2025-02-07', 22, 'BrightWave Media', 104, 'Analytics Module', 3, 199.99, 599.97, 'Emily Brown', 'North'),
('2025-02-08', 23, 'OceanGate Shipping', 103, 'Enterprise Support', 6, 999.99, 5999.94, 'Mike Davis', 'West');


-- Sample HR data
USE hr_dept;

INSERT IGNORE INTO employees 
(employee_code, first_name, last_name, email, phone, department, position, hire_date, salary, status) 
VALUES
('EMP001', 'John', 'Smith', 'john.smith@company.com', '555-1001', 'Sales', 'Sales Manager', '2020-01-15', 85000.00, 'active'),
('EMP002', 'Sarah', 'Johnson', 'sarah.johnson@company.com', '555-1002', 'Sales', 'Sales Representative', '2021-03-10', 65000.00, 'active'),
('EMP003', 'Mike', 'Davis', 'mike.davis@company.com', '555-1003', 'Sales', 'Sales Representative', '2021-06-20', 65000.00, 'active'),
('EMP004', 'Emily', 'Brown', 'emily.brown@company.com', '555-1004', 'HR', 'HR Manager', '2019-08-01', 80000.00, 'active'),
('EMP005', 'David', 'Wilson', 'david.wilson@company.com', '555-1005', 'Finance', 'Finance Manager', '2020-02-15', 90000.00, 'active'),

('EMP006', 'Olivia', 'Taylor', 'olivia.taylor@company.com', '555-1006', 'IT', 'IT Support Engineer', '2022-04-12', 62000.00, 'active'),
('EMP007', 'Ethan', 'Clark', 'ethan.clark@company.com', '555-1007', 'IT', 'Network Administrator', '2020-10-05', 70000.00, 'active'),
('EMP008', 'Ava', 'Martinez', 'ava.martinez@company.com', '555-1008', 'Marketing', 'Marketing Executive', '2021-09-18', 58000.00, 'active'),
('EMP009', 'Noah', 'Anderson', 'noah.anderson@company.com', '555-1009', 'Marketing', 'Digital Marketing Specialist', '2022-01-22', 60000.00, 'active'),
('EMP010', 'Sophia', 'Thomas', 'sophia.thomas@company.com', '555-1010', 'HR', 'HR Executive', '2021-07-14', 55000.00, 'active'),

('EMP011', 'Liam', 'Moore', 'liam.moore@company.com', '555-1011', 'Finance', 'Accountant', '2020-11-20', 63000.00, 'active'),
('EMP012', 'Isabella', 'Jackson', 'isabella.jackson@company.com', '555-1012', 'Finance', 'Financial Analyst', '2021-02-10', 68000.00, 'active'),
('EMP013', 'Mason', 'White', 'mason.white@company.com', '555-1013', 'Operations', 'Operations Manager', '2019-03-05', 82000.00, 'active'),
('EMP014', 'Mia', 'Harris', 'mia.harris@company.com', '555-1014', 'Operations', 'Operations Executive', '2022-06-01', 57000.00, 'active'),
('EMP015', 'James', 'Martin', 'james.martin@company.com', '555-1015', 'Sales', 'Key Account Executive', '2021-11-10', 69000.00, 'active'),

('EMP016', 'Charlotte', 'Thompson', 'charlotte.thompson@company.com', '555-1016', 'Support', 'Support Specialist', '2020-08-17', 52000.00, 'active'),
('EMP017', 'Henry', 'Garcia', 'henry.garcia@company.com', '555-1017', 'Support', 'Technical Support Engineer', '2021-05-30', 56000.00, 'active'),
('EMP018', 'Amelia', 'Martins', 'amelia.martins@company.com', '555-1018', 'Sales', 'Sales Coordinator', '2022-02-25', 50000.00, 'active'),
('EMP019', 'Jacob', 'Rodriguez', 'jacob.rodriguez@company.com', '555-1019', 'IT', 'Software Developer', '2020-09-19', 78000.00, 'active'),
('EMP020', 'Harper', 'Lewis', 'harper.lewis@company.com', '555-1020', 'IT', 'System Engineer', '2019-12-12', 83000.00, 'active'),

('EMP021', 'Daniel', 'Walker', 'daniel.walker@company.com', '555-1021', 'Finance', 'Senior Accountant', '2018-07-23', 75000.00, 'active'),
('EMP022', 'Evelyn', 'Hall', 'evelyn.hall@company.com', '555-1022', 'HR', 'Recruitment Specialist', '2021-04-11', 58000.00, 'active'),
('EMP023', 'Michael', 'Allen', 'michael.allen@company.com', '555-1023', 'Marketing', 'Brand Strategist', '2022-03-09', 65000.00, 'active'),
('EMP024', 'Ella', 'Young', 'ella.young@company.com', '555-1024', 'Operations', 'Supply Chain Analyst', '2020-06-28', 72000.00, 'active'),
('EMP025', 'Alexander', 'King', 'alexander.king@company.com', '555-1025', 'Support', 'Customer Support Lead', '2019-10-14', 60000.00, 'active');

-- Sample Finance data
USE finance_dept;

INSERT IGNORE INTO expenses 
(expense_date, category, description, amount, department, submitted_by, approved_by, status) 
VALUES
('2025-01-10', 'Marketing', 'Q1 Marketing Campaign', 15000.00, 'Marketing', 'Jane Doe', 'David Wilson', 'approved'),
('2025-01-12', 'IT', 'Software Licenses Purchase', 8500.00, 'IT', 'Tech Team', 'David Wilson', 'approved'),
('2025-01-15', 'Office', 'Office Supplies (Q1 Restock)', 1200.00, 'Administration', 'Admin Staff', 'David Wilson', 'approved'),
('2025-01-18', 'Travel', 'Client Visit – Chicago', 3500.00, 'Sales', 'John Smith', NULL, 'pending'),
('2025-01-22', 'Training', 'Employee Skill Training Program', 2500.00, 'HR', 'Emily Brown', 'David Wilson', 'approved'),
('2025-01-25', 'Facilities', 'Office Furniture Upgrade', 7000.00, 'Administration', 'Admin Staff', NULL, 'pending'),
('2025-01-28', 'Marketing', 'Social Media Ad Campaign', 4200.00, 'Marketing', 'Ava Martinez', 'David Wilson', 'approved'),
('2025-02-01', 'IT', 'Server Maintenance Contract', 5400.00, 'IT', 'Tech Team', NULL, 'pending'),
('2025-02-04', 'Office', 'Paper, Printers & Ink Supplies', 900.00, 'Administration', 'Admin Staff', 'David Wilson', 'approved'),
('2025-02-06', 'Travel', 'Conference Trip – New York', 4800.00, 'Sales', 'Sarah Johnson', NULL, 'pending'),
('2025-02-08', 'R&D', 'Equipment Purchase for R&D Lab', 12000.00, 'R&D', 'InnoTech Team', 'David Wilson', 'approved'),
('2025-02-10', 'Legal', 'Contract Review Charges', 1800.00, 'Legal', 'Legal Team', 'David Wilson', 'approved'),
('2025-02-12', 'IT', 'Cybersecurity Subscription', 3600.00, 'IT', 'Tech Team', 'David Wilson', 'approved'),
('2025-02-14', 'Marketing', 'Billboard Advertising', 7000.00, 'Marketing', 'Ava Martinez', NULL, 'pending'),
('2025-02-16', 'Office', 'Coffee Machine Replacement', 450.00, 'Administration', 'Admin Staff', 'David Wilson', 'approved');


INSERT IGNORE INTO revenue 
(revenue_date, source, amount, department, notes) 
VALUES
('2025-01-15', 'Software Sales', 50000.00, 'Sales', 'Q1 Software licenses'),
('2025-01-20', 'Consulting Services', 35000.00, 'Consulting', 'Enterprise consulting project'),
('2025-01-25', 'Support Contracts', 25000.00, 'Support', 'Annual support renewals'),
('2025-01-30', 'Cloud Services', 22000.00, 'IT', 'Monthly cloud hosting revenue'),
('2025-02-02', 'Product Licensing', 40000.00, 'Product', 'License renewals from enterprise clients'),
('2025-02-05', 'Training Sessions', 8000.00, 'HR', 'Corporate training program for clients'),
('2025-02-07', 'Maintenance Services', 12000.00, 'Support', 'Quarterly maintenance billing'),
('2025-02-10', 'Partnership Income', 15000.00, 'Marketing', 'Joint revenue from co-branding campaign'),
('2025-02-12', 'Analytics Subscription', 18000.00, 'Product', 'New customers added in February'),
('2025-02-15', 'Implementation Services', 28000.00, 'Operations', 'On-site system deployment revenue');

-- ============================================
-- Added schemas + tables + 25 sample rows each (marketing, it, operations, cs, product, legal, procurement, rnd, support)
-- ============================================

-- MARKETING DEPARTMENT
CREATE DATABASE IF NOT EXISTS marketing_dept;
USE marketing_dept;

CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    channel VARCHAR(50),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    owner VARCHAR(100),
    status VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_owner(owner),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO marketing_campaigns (name, channel, start_date, end_date, budget, owner, status) VALUES
('Q1 Social Awareness', 'Social', '2025-01-05', '2025-03-31', 12000.00, 'Ava Martinez', 'completed'),
('Spring Product Launch', 'Email', '2025-03-01', '2025-04-30', 25000.00, 'Michael Allen', 'active'),
('SEO Optimization Push', 'Organic', '2025-02-01', '2025-06-30', 8000.00, 'Noah Anderson', 'active'),
('Paid Ads - North', 'Paid', '2025-01-10', '2025-02-28', 15000.00, 'Ava Martinez', 'completed'),
('Brand Awareness Q2', 'Social', '2025-04-01', '2025-06-30', 30000.00, 'Michael Allen', 'planned'),
('Referral Program', 'Referral', '2025-02-15', '2025-08-15', 6000.00, 'Sarah Johnson', 'active'),
('Influencer Collab', 'Social', '2025-05-01', '2025-05-31', 10000.00, 'Ella Young', 'planned'),
('Webinar Series', 'Webinar', '2025-03-10', '2025-04-10', 4000.00, 'David Wilson', 'completed'),
('Content Marketing Q1', 'Content', '2025-01-01', '2025-03-31', 7000.00, 'Noah Anderson', 'completed'),
('Retargeting Campaign', 'Paid', '2025-02-20', '2025-05-20', 9000.00, 'Ava Martinez', 'active'),
('Product Teaser', 'Email', '2025-05-10', '2025-05-25', 3500.00, 'Michael Allen', 'planned'),
('Trade Show Sponsorship', 'Events', '2025-06-01', '2025-06-05', 20000.00, 'Ella Young', 'planned'),
('Customer Stories', 'Content', '2025-01-15', '2025-04-15', 5000.00, 'Noah Anderson', 'active'),
('Holiday Promo', 'Email', '2024-12-01', '2024-12-31', 8000.00, 'Ava Martinez', 'completed'),
('App Launch Campaign', 'Social', '2025-02-01', '2025-03-15', 18000.00, 'Michael Allen', 'completed'),
('Channel Partner Promo', 'Partner', '2025-03-01', '2025-07-01', 12000.00, 'David Wilson', 'active'),
('Product Demo Ads', 'Paid', '2025-04-10', '2025-05-10', 9000.00, 'Sarah Johnson', 'planned'),
('Local Outreach', 'Local', '2025-01-20', '2025-02-28', 3000.00, 'Ella Young', 'completed'),
('Case Study Drive', 'Content', '2025-02-10', '2025-03-10', 2500.00, 'Noah Anderson', 'completed'),
('Video Series Q2', 'Video', '2025-04-15', '2025-06-15', 15000.00, 'Ava Martinez', 'planned'),
('Partnership Webinar', 'Webinar', '2025-05-20', '2025-05-20', 2000.00, 'Sarah Johnson', 'planned'),
('Lifecycle Email Flows', 'Email', '2025-01-01', '2025-12-31', 9000.00, 'Michael Allen', 'active'),
('Customer Winback', 'Email', '2025-03-01', '2025-04-15', 4000.00, 'Ella Young', 'completed'),
('PR Outreach Q1', 'PR', '2025-02-01', '2025-02-28', 6000.00, 'David Wilson', 'completed'),
('Direct Mail Pilot', 'Mail', '2025-06-01', '2025-07-01', 2500.00, 'Noah Anderson', 'planned');

-- IT DEPARTMENT
CREATE DATABASE IF NOT EXISTS it_dept;
USE it_dept;

CREATE TABLE IF NOT EXISTS it_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) UNIQUE,
    asset_type VARCHAR(50),
    assigned_to VARCHAR(100),
    purchase_date DATE,
    warranty_end DATE,
    status VARCHAR(30),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_type (asset_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO it_assets (asset_tag, asset_type, assigned_to, purchase_date, warranty_end, status, location) VALUES
('IT-1001', 'Laptop', 'John Smith', '2023-01-15', '2026-01-15', 'active', 'HQ - Desk 101'),
('IT-1002', 'Desktop', 'Sarah Johnson', '2022-07-10', '2025-07-10', 'active', 'HQ - Desk 102'),
('IT-1003', 'Server', 'DataCenter', '2021-11-01', '2026-11-01', 'maintenance', 'DC-1 Rack 3'),
('IT-1004', 'Router', 'Network Team', '2024-02-12', '2027-02-12', 'active', 'HQ - Network Room'),
('IT-1005', 'Switch', 'Network Team', '2024-03-05', '2027-03-05', 'active', 'HQ - Network Room'),
('IT-1006', 'Laptop', 'Mike Davis', '2023-05-20', '2026-05-20', 'active', 'HQ - Desk 103'),
('IT-1007', 'Monitor', 'Emily Brown', '2022-08-01', '2025-08-01', 'active', 'HQ - Desk 104'),
('IT-1008', 'Printer', 'Admin', '2020-10-10', '2025-10-10', 'active', 'HQ - Admin Area'),
('IT-1009', 'Phone', 'David Wilson', '2021-04-04', '2024-04-04', 'retired', 'N/A'),
('IT-1010', 'Laptop', 'Olivia Taylor', '2024-01-12', '2027-01-12', 'active', 'HQ - Desk 105'),
('IT-1011', 'Tablet', 'Ava Martinez', '2023-09-18', '2026-09-18', 'active', 'HQ - Desk 106'),
('IT-1012', 'Server', 'DataCenter', '2022-06-15', '2027-06-15', 'active', 'DC-1 Rack 4'),
('IT-1013', 'Firewall', 'Network Team', '2023-12-01', '2026-12-01', 'active', 'HQ - Network Room'),
('IT-1014', 'Laptop', 'Noah Anderson', '2024-01-22', '2027-01-22', 'active', 'Remote'),
('IT-1015', 'NAS', 'Storage Team', '2022-03-30', '2025-03-30', 'maintenance', 'DC-2 Rack 2'),
('IT-1016', 'UPS', 'Facilities', '2020-02-20', '2025-02-20', 'active', 'DC-1'),
('IT-1017', 'Monitor', 'Sophia Thomas', '2021-07-14', '2024-07-14', 'active', 'HQ - Desk 110'),
('IT-1018', 'Laptop', 'Liam Moore', '2020-11-20', '2023-11-20', 'retired', 'N/A'),
('IT-1019', 'Phone', 'Isabella Jackson', '2021-02-10', '2024-02-10', 'active', 'HQ - Desk 112'),
('IT-1020', 'Desktop', 'Mason White', '2019-03-05', '2024-03-05', 'active', 'HQ - Desk 113'),
('IT-1021', 'Laptop', 'Mia Harris', '2022-06-01', '2025-06-01', 'active', 'HQ - Desk 114'),
('IT-1022', 'Router', 'Remote Office', '2023-04-01', '2026-04-01', 'active', 'Remote Site A'),
('IT-1023', 'Monitor', 'James Martin', '2021-11-10', '2024-11-10', 'active', 'HQ - Desk 115'),
('IT-1024', 'Server', 'DataCenter', '2024-05-01', '2029-05-01', 'active', 'DC-2 Rack 1'),
('IT-1025', 'Laptop', 'Charlotte Thompson', '2020-08-17', '2023-08-17', 'retired', 'N/A');

-- OPERATIONS DEPARTMENT
CREATE DATABASE IF NOT EXISTS operations_dept;
USE operations_dept;

CREATE TABLE IF NOT EXISTS shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_code VARCHAR(50) UNIQUE,
    origin VARCHAR(100),
    destination VARCHAR(100),
    ship_date DATE,
    delivery_date DATE,
    carrier VARCHAR(100),
    status VARCHAR(50),
    weight_kg DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status(status),
    INDEX idx_origin(origin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO shipments (shipment_code, origin, destination, ship_date, delivery_date, carrier, status, weight_kg) VALUES
('SHP-2001', 'New York, NY', 'Chicago, IL', '2025-01-05', '2025-01-07', 'FastFreight', 'delivered', 1200.50),
('SHP-2002', 'San Francisco, CA', 'Los Angeles, CA', '2025-01-10', '2025-01-11', 'WestCarrier', 'delivered', 450.00),
('SHP-2003', 'Houston, TX', 'Dallas, TX', '2025-01-12', '2025-01-13', 'SouthShip', 'delivered', 300.00),
('SHP-2004', 'Seattle, WA', 'Portland, OR', '2025-01-15', '2025-01-16', 'NorthLogistics', 'delivered', 220.75),
('SHP-2005', 'Boston, MA', 'Atlanta, GA', '2025-01-18', '2025-01-21', 'EastExpress', 'delivered', 980.00),
('SHP-2006', 'Miami, FL', 'Charlotte, NC', '2025-01-20', '2025-01-22', 'CoastalCargo', 'in_transit', 540.00),
('SHP-2007', 'Denver, CO', 'Las Vegas, NV', '2025-01-22', '2025-01-23', 'RockyRoad', 'delivered', 330.00),
('SHP-2008', 'Phoenix, AZ', 'Tucson, AZ', '2025-01-25', '2025-01-25', 'LocalLine', 'delivered', 45.00),
('SHP-2009', 'Cleveland, OH', 'Pittsburgh, PA', '2025-01-26', '2025-01-27', 'MidwestMovers', 'delivered', 220.00),
('SHP-2010', 'Austin, TX', 'San Antonio, TX', '2025-01-28', '2025-01-28', 'HillCountry', 'delivered', 80.00),
('SHP-2011', 'Orlando, FL', 'Jacksonville, FL', '2025-01-29', '2025-01-30', 'Sunshine Cargo', 'delivered', 140.00),
('SHP-2012', 'Minneapolis, MN', 'Milwaukee, WI', '2025-02-01', '2025-02-02', 'NorthernRoutes', 'delivered', 260.00),
('SHP-2013', 'Detroit, MI', 'Columbus, OH', '2025-02-03', '2025-02-04', 'GreatLakes', 'in_transit', 600.00),
('SHP-2014', 'Nashville, TN', 'Memphis, TN', '2025-02-05', '2025-02-06', 'SouthernTrack', 'delivered', 190.00),
('SHP-2015', 'Salt Lake City, UT', 'Boise, ID', '2025-02-07', '2025-02-09', 'MountainExpress', 'in_transit', 720.00),
('SHP-2016', 'Jacksonville, FL', 'Tampa, FL', '2025-02-10', '2025-02-10', 'GulfCarrier', 'delivered', 65.00),
('SHP-2017', 'Kansas City, MO', 'Omaha, NE', '2025-02-11', '2025-02-12', 'PlainsLogistics', 'delivered', 410.00),
('SHP-2018', 'Raleigh, NC', 'Richmond, VA', '2025-02-13', '2025-02-14', 'EastCoastShip', 'delivered', 230.00),
('SHP-2019', 'Hartford, CT', 'Providence, RI', '2025-02-15', '2025-02-15', 'NewEnglandExpress', 'delivered', 55.00),
('SHP-2020', 'Indianapolis, IN', 'Louisville, KY', '2025-02-16', '2025-02-17', 'MidlandCargo', 'in_transit', 285.00),
('SHP-2021', 'Birmingham, AL', 'Mobile, AL', '2025-02-18', '2025-02-19', 'SouthernWaves', 'delivered', 130.00),
('SHP-2022', 'Anchorage, AK', 'Fairbanks, AK', '2025-02-20', '2025-02-23', 'ArcticLogistics', 'in_transit', 950.00),
('SHP-2023', 'Sacramento, CA', 'Fresno, CA', '2025-02-25', '2025-02-26', 'ValleyFreight', 'delivered', 210.00),
('SHP-2024', 'Albuquerque, NM', 'El Paso, TX', '2025-02-27', '2025-03-01', 'DesertLines', 'in_transit', 470.00),
('SHP-2025', 'Boulder, CO', 'Colorado Springs, CO', '2025-03-02', '2025-03-02', 'FrontRange', 'scheduled', 95.00);

-- CUSTOMER SUCCESS (CS_DEPT)
CREATE DATABASE IF NOT EXISTS cs_dept;
USE cs_dept;

CREATE TABLE IF NOT EXISTS cs_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(50) UNIQUE,
    customer_id INT,
    subject VARCHAR(200),
    priority VARCHAR(20),
    status VARCHAR(30),
    created_date DATE,
    resolved_date DATE,
    assigned_to VARCHAR(100),
    csat_score INT,
    notes TEXT,
    INDEX idx_customer(customer_id),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO cs_tickets (ticket_code, customer_id, subject, priority, status, created_date, resolved_date, assigned_to, csat_score, notes) VALUES
('TCK-3001', 1, 'Onboarding issue - setup', 'High', 'resolved', '2025-01-05', '2025-01-06', 'Charlotte Thompson', 9, 'Walked through setup.'),
('TCK-3002', 2, 'Billing question', 'Medium', 'resolved', '2025-01-07', '2025-01-08', 'Henry Garcia', 8, 'Invoice clarified.'),
('TCK-3003', 3, 'Feature request', 'Low', 'open', '2025-01-10', NULL, 'Amelia Martins', NULL, 'Request logged.'),
('TCK-3004', 4, 'Integration failure', 'High', 'resolved', '2025-01-12', '2025-01-13', 'Daniel Walker', 7, 'Fixed config.'),
('TCK-3005', 5, 'Performance degradation', 'High', 'in_progress', '2025-01-14', NULL, 'Henry Garcia', NULL, 'Investigating.'),
('TCK-3006', 6, 'User access problem', 'Medium', 'resolved', '2025-01-16', '2025-01-17', 'Charlotte Thompson', 9, 'Reset permissions.'),
('TCK-3007', 7, 'Data sync delay', 'Medium', 'resolved', '2025-01-18', '2025-01-19', 'Amelia Martins', 8, 'Optimized sync.'),
('TCK-3008', 8, 'API rate limit', 'Low', 'resolved', '2025-01-20', '2025-01-21', 'Daniel Walker', 8, 'Increased limits.'),
('TCK-3009', 9, 'Account migration', 'High', 'resolved', '2025-01-22', '2025-01-24', 'Henry Garcia', 10, 'Migration complete.'),
('TCK-3010', 10, 'Training request', 'Low', 'resolved', '2025-01-25', '2025-01-27', 'Charlotte Thompson', 9, 'Delivered session.'),
('TCK-3011', 11, 'Security concern', 'High', 'in_progress', '2025-01-28', NULL, 'Daniel Walker', NULL, 'Escalated.'),
('TCK-3012', 12, 'UI bug', 'Low', 'resolved', '2025-01-30', '2025-01-31', 'Amelia Martins', 7, 'Fixed in patch.'),
('TCK-3013', 13, 'Feature clarification', 'Low', 'resolved', '2025-02-01', '2025-02-02', 'Charlotte Thompson', 8, 'Explained behavior.'),
('TCK-3014', 14, 'Contract renewal help', 'Medium', 'resolved', '2025-02-03', '2025-02-05', 'Henry Garcia', 9, 'Renewal processed.'),
('TCK-3015', 15, 'Custom report needed', 'Medium', 'open', '2025-02-06', NULL, 'Amelia Martins', NULL, 'Requirements gathering.'),
('TCK-3016', 16, 'SDK integration issue', 'High', 'in_progress', '2025-02-07', NULL, 'Daniel Walker', NULL, 'Dev team investigating.'),
('TCK-3017', 17, 'Password reset', 'Low', 'resolved', '2025-02-08', '2025-02-08', 'Charlotte Thompson', 10, 'Reset completed.'),
('TCK-3018', 18, 'Invoice dispute', 'Medium', 'resolved', '2025-02-09', '2025-02-11', 'Henry Garcia', 8, 'Adjusted invoice.'),
('TCK-3019', 19, 'Onboarding docs request', 'Low', 'resolved', '2025-02-12', '2025-02-12', 'Amelia Martins', 9, 'Sent docs.'),
('TCK-3020', 20, 'Performance tuning', 'Medium', 'in_progress', '2025-02-13', NULL, 'Daniel Walker', NULL, 'Working on improvements.'),
('TCK-3021', 21, 'Custom SLA', 'High', 'open', '2025-02-14', NULL, 'Charlotte Thompson', NULL, 'Drafting SLA.'),
('TCK-3022', 22, 'Feature rollout issue', 'High', 'resolved', '2025-02-15', '2025-02-16', 'Henry Garcia', 7, 'Rollback and fix.'),
('TCK-3023', 23, 'Request for demo env', 'Low', 'resolved', '2025-02-16', '2025-02-17', 'Amelia Martins', 9, 'Provisioned demo.'),
('TCK-3024', 24, 'Data export', 'Medium', 'resolved', '2025-02-18', '2025-02-19', 'Daniel Walker', 8, 'Export provided.'),
('TCK-3025', 25, 'Localization issue', 'Low', 'resolved', '2025-02-20', '2025-02-21', 'Charlotte Thompson', 7, 'Fixed locale file.');

-- PRODUCT MANAGEMENT (product_dept)
CREATE DATABASE IF NOT EXISTS product_dept;
USE product_dept;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(80) UNIQUE,
    name VARCHAR(200),
    version VARCHAR(50),
    release_date DATE,
    lifecycle_stage VARCHAR(50),
    owner VARCHAR(100),
    revenue_segment VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sku(sku),
    INDEX idx_owner(owner)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO products (sku, name, version, release_date, lifecycle_stage, owner, revenue_segment) VALUES
('PRD-5001', 'Analytics Suite', '3.2', '2024-11-10', 'growth', 'Product Team', 'Enterprise'),
('PRD-5002', 'Cloud Storage', '2.5', '2023-06-01', 'mature', 'Product Team', 'SMB'),
('PRD-5003', 'Support Portal', '1.8', '2024-01-15', 'growth', 'Product Team', 'Support'),
('PRD-5004', 'Mobile App', '4.0', '2025-02-01', 'launch', 'Product Team', 'Consumer'),
('PRD-5005', 'Integration SDK', '2.0', '2023-09-20', 'mature', 'Product Team', 'DevTools'),
('PRD-5006', 'Reporting Module', '1.4', '2024-05-05', 'growth', 'Product Team', 'Enterprise'),
('PRD-5007', 'Security Add-on', '1.0', '2024-10-10', 'growth', 'Product Team', 'Security'),
('PRD-5008', 'Collaboration Suite', '5.1', '2022-08-01', 'mature', 'Product Team', 'Enterprise'),
('PRD-5009', 'Billing Engine', '3.0', '2023-12-12', 'growth', 'Finance', 'Platform'),
('PRD-5010', 'Monitoring Tool', '2.2', '2024-03-03', 'growth', 'Product Team', 'ITOps'),
('PRD-5011', 'AI Assistant', '0.9', '2025-01-20', 'beta', 'Product Team', 'AI'),
('PRD-5012', 'Workflow Builder', '1.1', '2024-07-07', 'growth', 'Product Team', 'Enterprise'),
('PRD-5013', 'Data Connector', '2.3', '2023-11-11', 'mature', 'Product Team', 'Integrations'),
('PRD-5014', 'Localization Pack', '1.0', '2024-02-02', 'growth', 'Product Team', 'Global'),
('PRD-5015', 'Analytics Lite', '1.0', '2024-09-09', 'growth', 'Product Team', 'SMB'),
('PRD-5016', 'Compliance Module', '1.2', '2023-04-04', 'mature', 'Legal', 'Compliance'),
('PRD-5017', 'Docs Portal', '2.0', '2022-12-12', 'mature', 'Product Team', 'Support'),
('PRD-5018', 'Feature Flags', '1.5', '2024-06-06', 'growth', 'Product Team', 'Platform'),
('PRD-5019', 'Search Service', '3.3', '2023-03-03', 'mature', 'Product Team', 'Core'),
('PRD-5020', 'Analytics Pro', '4.5', '2025-03-01', 'launch', 'Product Team', 'Enterprise'),
('PRD-5021', 'Onboarding Flow', '1.0', '2024-11-01', 'growth', 'Product Team', 'UserOps'),
('PRD-5022', 'Backup Service', '2.1', '2023-05-05', 'mature', 'Product Team', 'ITOps'),
('PRD-5023', 'Scheduling API', '1.0', '2024-08-08', 'growth', 'Product Team', 'Integrations'),
('PRD-5024', 'Experimentation Platform', '0.8', '2025-02-14', 'beta', 'Product Team', 'Platform'),
('PRD-5025', 'Data Warehouse Sync', '1.7', '2024-10-20', 'growth', 'Product Team', 'Analytics');

-- LEGAL DEPARTMENT
CREATE DATABASE IF NOT EXISTS legal_dept;
USE legal_dept;

CREATE TABLE IF NOT EXISTS legal_contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_code VARCHAR(80) UNIQUE,
    title VARCHAR(200),
    counterparty VARCHAR(200),
    start_date DATE,
    end_date DATE,
    value DECIMAL(14,2),
    owner VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_counterparty(counterparty),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO legal_contracts (contract_code, title, counterparty, start_date, end_date, value, owner, status) VALUES
('CTR-6001', 'Enterprise License - Acme', 'Acme Corporation', '2025-01-15', '2026-01-14', 49999.00, 'Legal Team', 'active'),
('CTR-6002', 'Support Agreement - Tech Solutions', 'Tech Solutions Inc', '2025-01-16', '2026-01-15', 14999.00, 'Legal Team', 'active'),
('CTR-6003', 'Consulting Contract - Global Traders', 'Global Traders', '2025-01-17', '2025-12-31', 29999.00, 'Legal Team', 'active'),
('CTR-6004', 'SaaS Agreement - BlueWave', 'BlueWave Industries', '2025-01-18', '2026-01-17', 31999.00, 'Legal Team', 'active'),
('CTR-6005', 'Procurement Terms - Prime Logistics', 'Prime Logistics', '2025-01-19', '2026-01-18', 15999.00, 'Legal Team', 'active'),
('CTR-6006', 'NDAs Batch A', 'Multiple', '2025-01-20', '2027-01-19', 0.00, 'Legal Team', 'active'),
('CTR-6007', 'Partnership - NextGen', 'NextGen Software', '2025-01-21', '2027-01-20', 25000.00, 'Legal Team', 'active'),
('CTR-6008', 'Reseller Agreement', 'Urban Retail Corp', '2025-01-22', '2026-01-22', 12000.00, 'Legal Team', 'active'),
('CTR-6009', 'Service Level Agreement', 'NorthStar Electronics', '2025-01-23', '2026-01-23', 18000.00, 'Legal Team', 'active'),
('CTR-6010', 'Data Processing Addendum', 'Summit Healthcare', '2025-01-24', '2026-01-24', 0.00, 'Legal Team', 'active'),
('CTR-6011', 'License Amendment', 'Evergreen Foods', '2025-01-25', '2026-01-25', 8000.00, 'Legal Team', 'active'),
('CTR-6012', 'Maintenance Contract', 'Pioneer Energy Group', '2025-01-26', '2026-01-26', 19999.00, 'Legal Team', 'active'),
('CTR-6013', 'Consulting Framework', 'Velocity Motors', '2025-01-27', '2026-01-27', 14000.00, 'Legal Team', 'active'),
('CTR-6014', 'Software License', 'BrightStart Education', '2025-01-28', '2026-01-28', 10000.00, 'Legal Team', 'active'),
('CTR-6015', 'Cloud Hosting Agreement', 'Silverline Finance', '2025-01-29', '2026-01-29', 22000.00, 'Legal Team', 'active'),
('CTR-6016', 'Implementation Services', 'RedRock Construction', '2025-01-30', '2026-01-30', 15000.00, 'Legal Team', 'active'),
('CTR-6017', 'R&D Equipment Lease', 'InnoTech Labs', '2025-02-01', '2026-02-01', 12000.00, 'Legal Team', 'active'),
('CTR-6018', 'Network Services', 'FutureCom Networks', '2025-02-02', '2026-02-02', 11000.00, 'Legal Team', 'active'),
('CTR-6019', 'Supply Agreement', 'Apex Hardware Supplies', '2025-02-03', '2026-02-03', 9000.00, 'Legal Team', 'active'),
('CTR-6020', 'Ad Campaign Contract', 'MountainPeak Apparel', '2025-02-04', '2025-08-04', 7000.00, 'Legal Team', 'active'),
('CTR-6021', 'Training Services', 'GreenLeaf Organics', '2025-02-05', '2026-02-05', 8000.00, 'Legal Team', 'active'),
('CTR-6022', 'Logistics Support', 'Starline Aviation', '2025-02-06', '2026-02-06', 16000.00, 'Legal Team', 'active'),
('CTR-6023', 'Media Services', 'BrightWave Media', '2025-02-07', '2026-02-07', 9000.00, 'Legal Team', 'active'),
('CTR-6024', 'Shipping Agreement', 'OceanGate Shipping', '2025-02-08', '2026-02-08', 20000.00, 'Legal Team', 'active'),
('CTR-6025', 'Support Renewal', 'CloudCore Systems', '2025-02-09', '2026-02-09', 15000.00, 'Legal Team', 'active');

-- PROCUREMENT DEPARTMENT
CREATE DATABASE IF NOT EXISTS procurement_dept;
USE procurement_dept;

CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_code VARCHAR(80) UNIQUE,
    name VARCHAR(200),
    contact_person VARCHAR(100),
    email VARCHAR(120),
    phone VARCHAR(30),
    category VARCHAR(100),
    rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name(name),
    INDEX idx_category(category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO vendors (vendor_code, name, contact_person, email, phone, category, rating) VALUES
('VND-7001', 'Office Supplies Co', 'Jane Doe', 'jane@offsup.com', '555-2001', 'Office', 4),
('VND-7002', 'ServerWorks', 'Tom Reed', 'tom@serverworks.com', '555-2002', 'IT', 5),
('VND-7003', 'LogiTrans', 'Paul Green', 'paul@logitrans.com', '555-2003', 'Logistics', 4),
('VND-7004', 'CleanServ', 'Mary Scott', 'mary@cleanserv.com', '555-2004', 'Facilities', 3),
('VND-7005', 'CaterRight', 'Lina Patel', 'lina@caterright.com', '555-2005', 'Catering', 5),
('VND-7006', 'FurniCo', 'Alex Brown', 'alex@furnico.com', '555-2006', 'Furniture', 4),
('VND-7007', 'Ink & Paper Ltd', 'Sam White', 'sam@inkpaper.com', '555-2007', 'Office', 3),
('VND-7008', 'CloudHost Inc', 'Rita Singh', 'rita@cloudhost.com', '555-2008', 'IT', 5),
('VND-7009', 'Security Solutions', 'Ben Morris', 'ben@secsol.com', '555-2009', 'Security', 4),
('VND-7010', 'TransportPros', 'Nina Gomez', 'nina@transportpros.com', '555-2010', 'Logistics', 4),
('VND-7011', 'RND Equip', 'Oscar Diaz', 'oscar@rndequip.com', '555-2011', 'R&D', 4),
('VND-7012', 'AdAgency', 'Kim Park', 'kim@adagency.com', '555-2012', 'Marketing', 5),
('VND-7013', 'LegalAssist', 'Iris Lee', 'iris@legalassist.com', '555-2013', 'Legal', 5),
('VND-7014', 'PrinterWorld', 'Gary King', 'gary@printerworld.com', '555-2014', 'Office', 3),
('VND-7015', 'EcoPackaging', 'Hannah Kim', 'hannah@ecopak.com', '555-2015', 'Packaging', 4),
('VND-7016', 'FurniturePlus', 'Leo Zhang', 'leo@furnitureplus.com', '555-2016', 'Furniture', 4),
('VND-7017', 'MicroParts', 'Sara Khan', 'sara@microparts.com', '555-2017', 'Hardware', 4),
('VND-7018', 'EventMasters', 'Tom Brown', 'tom@eventmasters.com', '555-2018', 'Events', 5),
('VND-7019', 'CafeSupplies', 'Maya Patel', 'maya@cafesup.com', '555-2019', 'Catering', 4),
('VND-7020', 'Office Movers', 'Rick Stone', 'rick@officemovers.com', '555-2020', 'Logistics', 3),
('VND-7021', 'NetSecure', 'Will Fox', 'will@netsecure.com', '555-2021', 'IT', 5),
('VND-7022', 'HardwareCentral', 'Ivy Chen', 'ivy@hardwarecentral.com', '555-2022', 'Hardware', 4),
('VND-7023', 'Printing Co', 'Derek Wu', 'derek@printingco.com', '555-2023', 'Office', 3),
('VND-7024', 'LabSuppliers', 'Nora Bell', 'nora@labsuppliers.com', '555-2024', 'R&D', 5),
('VND-7025', 'Green Logistics', 'Samir Roy', 'samir@greenlog.com', '555-2025', 'Logistics', 4);

-- RESEARCH & DEVELOPMENT (R&D)
CREATE DATABASE IF NOT EXISTS rnd_dept;
USE rnd_dept;

CREATE TABLE IF NOT EXISTS rnd_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_code VARCHAR(80) UNIQUE,
    title VARCHAR(200),
    project_lead VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    budget DECIMAL(14,2),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_lead(project_lead),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO rnd_projects (project_code, title, project_lead, start_date, end_date, status, budget, summary) VALUES
('RND-8001', 'ML Model for Forecasting', 'InnoTech Team', '2024-01-01', '2025-12-31', 'active', 50000.00, 'Time series forecasting models'),
('RND-8002', 'Edge Device Optimization', 'InnoTech Team', '2024-03-01', '2025-06-30', 'active', 40000.00, 'Optimize for embedded CPU'),
('RND-8003', 'Battery Tech Study', 'RND Labs', '2025-01-15', '2026-01-15', 'planned', 60000.00, 'Investigate new chemistries'),
('RND-8004', 'NLP Assistant', 'InnoTech Team', '2024-06-01', '2025-03-31', 'active', 45000.00, 'Conversational AI prototype'),
('RND-8005', 'Data Compression Research', 'RND Labs', '2023-09-01', '2024-12-31', 'completed', 15000.00, 'Efficient storage formats'),
('RND-8006', 'Robotics Perception', 'InnoTech Team', '2024-11-01', '2025-11-30', 'active', 75000.00, 'Computer vision for robots'),
('RND-8007', 'Quantum Simulation Study', 'RND Labs', '2023-01-01', '2025-12-31', 'active', 120000.00, 'Simulating quantum circuits'),
('RND-8008', 'Privacy-preserving ML', 'InnoTech Team', '2024-04-01', '2025-02-28', 'completed', 30000.00, 'Federated learning trials'),
('RND-8009', 'Battery Recycling', 'RND Labs', '2024-07-01', '2025-07-01', 'active', 25000.00, 'Process improvements'),
('RND-8010', 'Edge SDK', 'InnoTech Team', '2025-02-01', '2025-09-30', 'planned', 20000.00, 'Tools for edge devs'),
('RND-8011', 'Synthetic Data Generator', 'RND Labs', '2024-08-01', '2025-05-01', 'active', 18000.00, 'Create labeled synthetic sets'),
('RND-8012', 'Energy Efficiency', 'RND Labs', '2023-11-01', '2024-11-01', 'completed', 22000.00, 'Reduce server power use'),
('RND-8013', 'New Sensor Tech', 'InnoTech Team', '2025-03-01', '2026-03-01', 'planned', 90000.00, 'Prototype sensors'),
('RND-8014', 'Explainable AI', 'RND Labs', '2024-05-01', '2025-04-30', 'active', 28000.00, 'Interpretability methods'),
('RND-8015', 'Graph Analytics', 'InnoTech Team', '2023-05-01', '2024-05-01', 'completed', 16000.00, 'Graph neural networks'),
('RND-8016', 'Materials Testing', 'RND Labs', '2024-10-01', '2025-10-01', 'active', 40000.00, 'Stress tests for parts'),
('RND-8017', 'Prototype Automation', 'InnoTech Team', '2024-12-01', '2025-08-31', 'active', 35000.00, 'Automate prototype builds'),
('RND-8018', 'Edge Model Compression', 'RND Labs', '2024-09-01', '2025-06-30', 'active', 21000.00, 'Pruning and quantization'),
('RND-8019', 'New Material Alloy', 'RND Labs', '2023-02-01', '2025-02-28', 'completed', 50000.00, 'Alloy composition tests'),
('RND-8020', 'User Research Panel', 'InnoTech Team', '2024-02-01', '2024-12-31', 'completed', 8000.00, 'Feedback & studies'),
('RND-8021', 'Microcontroller Benchmarks', 'RND Labs', '2024-06-15', '2025-06-15', 'active', 12000.00, 'Performance comparisons'),
('RND-8022', 'Privacy Audit', 'InnoTech Team', '2024-01-10', '2024-05-10', 'completed', 6000.00, 'Audit of datasets'),
('RND-8023', 'Green Packaging R&D', 'RND Labs', '2025-01-01', '2025-12-31', 'active', 14000.00, 'Sustainable packaging'),
('RND-8024', 'Latency Profiling', 'InnoTech Team', '2024-11-15', '2025-04-15', 'active', 9000.00, 'Reduce API latency'),
('RND-8025', 'Edge Security Harden', 'RND Labs', '2025-02-15', '2026-02-14', 'planned', 30000.00, 'Harden firmware');

-- SUPPORT DEPARTMENT (support_dept)
CREATE DATABASE IF NOT EXISTS support_dept;
USE support_dept;

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_no VARCHAR(80) UNIQUE,
    customer VARCHAR(150),
    issue_type VARCHAR(100),
    priority VARCHAR(20),
    status VARCHAR(50),
    opened_on DATE,
    closed_on DATE,
    assigned_team VARCHAR(100),
    resolution_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status(status),
    INDEX idx_priority(priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO support_tickets (ticket_no, customer, issue_type, priority, status, opened_on, closed_on, assigned_team, resolution_text) VALUES
('SUP-9001', 'Acme Corporation', 'Login Failure', 'High', 'closed', '2025-01-05', '2025-01-05', 'Auth Team', 'Reset done'),
('SUP-9002', 'Tech Solutions Inc', 'Billing Error', 'Medium', 'closed', '2025-01-06', '2025-01-07', 'Billing Team', 'Invoice corrected'),
('SUP-9003', 'Global Traders', 'API Failure', 'High', 'in_progress', '2025-01-07', NULL, 'API Team', NULL),
('SUP-9004', 'BlueWave Industries', 'Data Loss', 'High', 'closed', '2025-01-08', '2025-01-09', 'Infra', 'Restored backup'),
('SUP-9005', 'Prime Logistics', 'Slow Performance', 'Medium', 'closed', '2025-01-09', '2025-01-10', 'Perf Team', 'Optimized DB'),
('SUP-9006', 'NextGen Software', 'Email Delivery', 'Low', 'closed', '2025-01-10', '2025-01-11', 'Mail Team', 'SPF update'),
('SUP-9007', 'Urban Retail Corp', 'Integration Error', 'Medium', 'closed', '2025-01-11', '2025-01-12', 'Integrations', 'Fixed webhook'),
('SUP-9008', 'NorthStar Electronics', 'Permission Issue', 'Low', 'closed', '2025-01-12', '2025-01-12', 'Auth Team', 'Permissions updated'),
('SUP-9009', 'Summit Healthcare', 'Compliance Question', 'Low', 'closed', '2025-01-13', '2025-01-14', 'Legal Support', 'Guidance provided'),
('SUP-9010', 'Evergreen Foods', 'Account Setup', 'Low', 'closed', '2025-01-14', '2025-01-15', 'Onboarding', 'Account created'),
('SUP-9011', 'Pioneer Energy Group', 'Backup Success', 'Low', 'closed', '2025-01-15', '2025-01-15', 'Infra', 'Routine check'),
('SUP-9012', 'Velocity Motors', 'Feature Bug', 'Medium', 'in_progress', '2025-01-16', NULL, 'QA Team', NULL),
('SUP-9013', 'BrightStart Education', 'Report Mismatch', 'Medium', 'closed', '2025-01-17', '2025-01-18', 'Reporting', 'Adjusted query'),
('SUP-9014', 'Silverline Finance', 'Security Alert', 'High', 'closed', '2025-01-18', '2025-01-19', 'SecOps', 'Incident contained'),
('SUP-9015', 'RedRock Construction', 'Install Help', 'Low', 'closed', '2025-01-19', '2025-01-20', 'Install Team', 'Assisted installation'),
('SUP-9016', 'InnoTech Labs', 'SDK Docs', 'Low', 'closed', '2025-01-20', '2025-01-21', 'Docs Team', 'Docs updated'),
('SUP-9017', 'FutureCom Networks', 'Latency Spike', 'Medium', 'in_progress', '2025-01-21', NULL, 'Network', NULL),
('SUP-9018', 'Apex Hardware Supplies', 'Order Query', 'Low', 'closed', '2025-01-22', '2025-01-23', 'Support', 'Order status provided'),
('SUP-9019', 'MountainPeak Apparel', 'API Rate', 'Low', 'closed', '2025-01-23', '2025-01-24', 'API Team', 'Rate limits adjusted'),
('SUP-9020', 'GreenLeaf Organics', 'UI Glitch', 'Low', 'closed', '2025-01-24', '2025-01-25', 'Frontend', 'CSS fix'),
('SUP-9021', 'Starline Aviation', 'Provisioning', 'Medium', 'closed', '2025-01-25', '2025-01-26', 'Provision Team', 'Provisioned env'),
('SUP-9022', 'BrightWave Media', 'Video Upload', 'Low', 'closed', '2025-01-26', '2025-01-27', 'Media Team', 'Resolved'),
('SUP-9023', 'OceanGate Shipping', 'Webhook Delay', 'Medium', 'closed', '2025-01-27', '2025-01-28', 'Integrations', 'Fixed queue'),
('SUP-9024', 'CloudCore Systems', 'DB Scaling', 'High', 'in_progress', '2025-01-28', NULL, 'DB Team', NULL),
('SUP-9025', 'GoldenLeaf Furniture', 'Certificate Issue', 'Low', 'closed', '2025-01-29', '2025-01-30', 'SecOps', 'Cert renewed');

-- If you want these BUs to also appear in your talk_to_database.business_units table, add entries (if not already present).
USE talk_to_database;

INSERT IGNORE INTO business_units (name, description, schema_name, created_by) VALUES
('Marketing Department', 'Marketing operations, campaigns, branding', 'marketing_dept', 1),
('IT Department', 'IT infrastructure, networks, systems and tools', 'it_dept', 1),
('Operations Department', 'Daily operational workflows and logistics', 'operations_dept', 1),
('Customer Success', 'Customer onboarding, retention and support', 'cs_dept', 1),
('Product Management', 'Product planning, roadmap & development insights', 'product_dept', 1),
('Legal Department', 'Compliance, legal operations and contract tracking', 'legal_dept', 1),
('Procurement Department', 'Vendor management and purchasing operations', 'procurement_dept', 1),
('Research & Development', 'Innovation, research pipelines and analysis', 'rnd_dept', 1),
('Support Department', 'Technical support and issue resolution', 'support_dept', 1);

-- Completion message
SELECT 'Database schema created successfully with expanded BUs and sample data!' as message;
