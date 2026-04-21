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

## 🗄️ Database Setup (PostgreSQL)

This application is currently running in **Mock Data Mode** for quick demonstration. To transition to a persistent database, use the provided `database.sql` file.

1.  **Create Database**:
    ```sql
    CREATE DATABASE pmcc_cms;
    ```
2.  **Run Schema**: Apply the full schema from `/database.sql`.
    ```bash
    psql -d pmcc_cms -f database.sql
    ```
3.  **Configure Environment**: Update `.env` with your PostgreSQL credentials.

### Building for Production
To create a production build:
```bash
npm run build
```

---

## 📊 Database Schema

The production schema is defined in `database.sql`. It includes advanced features like:
- **Granular Permissions**: JSONB based RBAC in the `users` table.
- **Media Tracking**: Integrated fields for testimonies and media assets.
- **Relational Integrity**: Foreign key constraints for members, users, and transactions.

---

## 🛠️ Implementation Checklist (Status)

1.  **Backend API [DONE]**: Express server implemented in `server.ts` with modular routes.
2.  **Mock Data [ACTIVE]**: Currently using `src/mockData.ts` for rapid exploration.
3.  **Database Bridge [PENDING]**: Transitioning from mock to persistent PostgreSQL.

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
