-- Prayer Miracle Church of Christ (PMCC) CMS - Database Schema
-- Compatible with PostgreSQL

-- 1. Users & RBAC
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Recommended to store bcrypt hashes
    role VARCHAR(20) NOT NULL DEFAULT 'User', -- Admin, Pastor, Finance, Media, User
    permissions JSONB DEFAULT '{
        "members": {"view": false, "edit": false},
        "finance": {"view": false, "edit": false},
        "testimonies": {"view": false, "edit": false},
        "media": {"view": false, "edit": false},
        "website": {"view": false, "edit": false},
        "users": {"view": false, "edit": false}
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Members
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Active', -- Active, Inactive, Transferred
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Finance & Transactions
CREATE TABLE finance_transactions (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- Income, Expense
    category VARCHAR(50) NOT NULL, -- Tithe, Offering, Utilities, Salary, etc.
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Completed', -- Pending, Completed, Cancelled
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Partnerships
CREATE TABLE partnerships (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- Missions, Building, Outreach
    commitment_amount DECIMAL(15, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- Weekly, Monthly, Yearly
    status VARCHAR(20) DEFAULT 'Active', -- Active, Paused, Completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Testimonies
CREATE TABLE testimonies (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Declined
    media_sent BOOLEAN DEFAULT FALSE,
    has_image BOOLEAN DEFAULT FALSE,
    media_urls JSONB DEFAULT '[]', -- Array of image/video URLs
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Baptism Requests
CREATE TABLE baptism_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    preferred_date DATE,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Scheduled, Completed
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Media Library
CREATE TABLE media_assets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- Image, Video, Document
    category VARCHAR(50), -- Sermon, Event, Testimony, Worship
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Website Configuration
CREATE TABLE website_settings (
    id SERIAL PRIMARY KEY,
    hero_title VARCHAR(255),
    hero_subtitle TEXT,
    primary_action_text VARCHAR(50),
    secondary_action_text VARCHAR(50),
    notification_email VARCHAR(255),
    meta_title VARCHAR(255),
    google_analytics_id VARCHAR(50),
    forms_enabled JSONB DEFAULT '{
        "partnership": true,
        "testimony": true,
        "baptism": true
    }',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data Seeding
-- NOTE: For password 'pmccsam1', you should generate a bcrypt hash.
-- Example hash for 'pmccsam1': $2b$10$7Z6Vp6/wT0E9/wR05W/Y.O (placeholder format)
INSERT INTO users (username, password_hash, role, permissions) 
VALUES ('admin', '$2y$10$PMCC.MOCK.HASH.FOR.pmccsam1.REPLACE.ME', 'Admin', '{
    "members": {"view": true, "edit": true},
    "finance": {"view": true, "edit": true},
    "testimonies": {"view": true, "edit": true},
    "media": {"view": true, "edit": true},
    "website": {"view": true, "edit": true},
    "users": {"view": true, "edit": true}
}');

INSERT INTO members (full_name, email, phone, join_date) 
VALUES ('John Doe', 'john@example.com', '123-456-7890', '2024-01-15');

INSERT INTO website_settings (hero_title, hero_subtitle, primary_action_text, secondary_action_text, notification_email)
VALUES ('Welcome to PMCC', 'Experience the power of prayer.', 'Join Us', 'Request Prayer', 'admin@pmcc.org');
