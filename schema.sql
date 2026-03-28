-- Ecclesia CMS Database Schema

CREATE DATABASE IF NOT EXISTS ecclesia_cms;
USE ecclesia_cms;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Pastor', 'Finance', 'Media') NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table (Finance)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('Income', 'Expense') NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status ENUM('Completed', 'Pending') DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partnerships Table
CREATE TABLE IF NOT EXISTS partnerships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    frequency ENUM('One-time', 'Monthly', 'Weekly') NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Testimonies Table
CREATE TABLE IF NOT EXISTS testimonies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Declined') DEFAULT 'Pending'
);

-- Baptism Requests Table
CREATE TABLE IF NOT EXISTS baptism_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    preferred_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Completed') DEFAULT 'Pending'
);

-- Media Table
CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('Video', 'Image') NOT NULL,
    category VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hero_title VARCHAR(255) NOT NULL,
    hero_subtitle TEXT,
    primary_action_text VARCHAR(50),
    secondary_action_text VARCHAR(50),
    notification_email VARCHAR(255),
    meta_title VARCHAR(255),
    google_analytics_id VARCHAR(50),
    forms_enabled JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Default Admin (password: admin123)
-- Hash: $2a$10$X7m8L0WqY6L6L6L6L6L6L6u8L0WqY6L6L6L6L6L6L6L6L6L6L6L6
-- Actually I'll use a real hash for 'admin123'
-- $2a$10$8K.q6G0X.q6G0X.q6G0X.u8K.q6G0X.q6G0X.q6G0X.q6G0X.q6G0X.
-- Wait, I'll just let the init script handle hashing.

-- Insert Default Website Settings
INSERT INTO website_settings (
    hero_title, 
    hero_subtitle, 
    primary_action_text, 
    secondary_action_text, 
    notification_email, 
    meta_title, 
    google_analytics_id, 
    forms_enabled
) VALUES (
    'Welcome to Prayer Miracle Church of Christ',
    'Experience the power of prayer and the miracle of faith.',
    'Join Us Online',
    'Request Prayer',
    'web-alerts@pmcc.org',
    'PMCC - Prayer Miracle Church of Christ',
    '',
    '{"partnership": true, "testimony": true, "baptism": true}'
) ON DUPLICATE KEY UPDATE id=id;
