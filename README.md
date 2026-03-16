# PMCC Church Management System

A comprehensive web application designed to manage church operations, including finance, membership, testimonies, baptism requests, media, and website content.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your database (see [Database Setup](#-database-setup-mysql) below).

### Running the Application
To start the development server (Express + Vite):
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🗄️ Database Setup (MySQL)

This application uses a MySQL backend. To set it up:

1.  **Create Database**:
    ```sql
    CREATE DATABASE ecclesia_cms;
    ```
2.  **Run Schema**: Use the following SQL to create the initial tables:
    ```sql
    CREATE TABLE members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      amount DECIMAL(15, 2) NOT NULL,
      type ENUM('Tithe', 'Offering', 'Expenditure', 'Partnership') NOT NULL,
      category VARCHAR(100),
      description TEXT,
      status ENUM('Completed', 'Pending', 'Cancelled') DEFAULT 'Pending',
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
3.  **Configure Environment**: Copy `.env.example` to `.env` and update the credentials:
    ```env
    DB_HOST=localhost
    DB_USER=your_username
    DB_PASSWORD=your_password
    DB_NAME=ecclesia_cms
    ```

### Building for Production
To create a production build:
```bash
npm run build
```

---

## 📊 Database Schema (Proposed)

To transition from the current simulated frontend to a fully functional system, the following database tables are recommended:

### 1. `users`
Manages administrative access and roles.
- `id`: UUID (Primary Key)
- `full_name`: VARCHAR(255)
- `email`: VARCHAR(255) (Unique)
- `password_hash`: VARCHAR(255)
- `role`: ENUM('Admin', 'Pastor', 'Finance', 'Media')
- `access_level`: ENUM('Full', 'Restricted', 'View-only')
- `status`: ENUM('Active', 'Locked')
- `created_at`: TIMESTAMP

### 2. `members`
General church membership records.
- `id`: UUID (Primary Key)
- `full_name`: VARCHAR(255)
- `email`: VARCHAR(255)
- `phone`: VARCHAR(20)
- `address`: TEXT
- `join_date`: DATE
- `status`: ENUM('Active', 'Inactive')

### 3. `transactions`
Financial records for tithes, offerings, and expenditures.
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `members` or `users`)
- `type`: ENUM('Tithe', 'Offering', 'Expenditure', 'Partnership')
- `amount`: DECIMAL(15, 2)
- `currency`: VARCHAR(3) (Default: 'UGX')
- `description`: TEXT
- `status`: ENUM('Completed', 'Pending', 'Cancelled')
- `transaction_date`: TIMESTAMP

### 4. `partnerships`
Tracking for church partners and their commitments.
- `id`: UUID (Primary Key)
- `member_id`: UUID (Foreign Key to `members`)
- `category`: VARCHAR(50) (e.g., Gold, Silver)
- `commitment_amount`: DECIMAL(15, 2)
- `frequency`: ENUM('Monthly', 'Weekly', 'One-time')
- `status`: ENUM('Active', 'Pending')

### 5. `testimonies`
Submissions from the church website.
- `id`: UUID (Primary Key)
- `full_name`: VARCHAR(255)
- `email`: VARCHAR(255)
- `title`: VARCHAR(255)
- `content`: TEXT
- `media_urls`: JSON (Array of image/video URLs)
- `status`: ENUM('Pending', 'Approved', 'Declined')
- `submitted_at`: TIMESTAMP

### 6. `baptism_requests`
Applications for baptism.
- `id`: UUID (Primary Key)
- `full_name`: VARCHAR(255)
- `email`: VARCHAR(255)
- `phone`: VARCHAR(20)
- `preferred_date`: DATE
- `status`: ENUM('Pending', 'Approved', 'Completed')
- `submitted_at`: TIMESTAMP

### 7. `media_assets`
Internal media library for church content.
- `id`: UUID (Primary Key)
- `title`: VARCHAR(255)
- `file_url`: VARCHAR(255)
- `file_type`: ENUM('Image', 'Video', 'Document')
- `category`: VARCHAR(50)
- `uploaded_by`: UUID (Foreign Key to `users`)
- `created_at`: TIMESTAMP

---

## 🛠️ Implementation Checklist (Status)

The system has been upgraded to a full-stack architecture with a MySQL backend.

1.  **Backend API [DONE]**: Express server implemented in `server.ts` with real `fetch()` integration in `assets/js/main.js`.
2.  **MySQL Integration [DONE]**: Database connection pool configured in `db.ts`.
3.  **Real Authentication [PENDING]**: Current system uses simulated auth. Recommend implementing JWT.
4.  **File Storage [PENDING]**: Integrate AWS S3 or Cloudinary for media.

---

## 🎨 Design System
- **Framework**: Bootstrap 5.3.3
- **Icons**: Bootstrap Icons
- **Charts**: Chart.js
- **Typography**: Inter (Sans-serif)
- **Color Palette**:
  - **Primary Purple**: `#5B0F8A` (Rich Purple) - Used for primary branding and active states.
  - **Accent Purple**: `#8E24AA` (Vibrant Purple) - Used for buttons and highlights.
  - **Sidebar Background**: `#4A0C73` (Deep Purple) - Used for the main navigation.
  - **Background Light**: `#E9D8F3` (Light Lavender) - Main application background.
  - **Text Dark**: `#2E0B47` (Dark Eggplant) - Primary text color.
  - **Hover Purple**: `#A64AC9` (Lighter Purple) - Used for interactive hover states.
