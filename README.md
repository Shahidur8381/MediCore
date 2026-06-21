# MediCore: Smart Hospital Management System

MediCore is a modern Hospital Management System designed to streamline healthcare operations. The project consists of a **Next.js** frontend, a **Node.js & Express** backend, and an **Oracle Database** (optimized for Oracle 11g XE).

---

## Prerequisites

Ensure you have the following installed on your machine:
1. **Node.js** (v18 or higher recommended)
2. **Oracle Database** (Oracle 11g XE or higher)
3. **Oracle Instant Client** (Required if using Thick Mode on your local operating system)

---

## 1. Database Setup

You need to set up the Oracle database schema before starting the servers.

1. Open your Oracle command-line tool (SQL*Plus, SQL Developer, or Run SQL Command Line).
2. Connect as `SYSTEM` (or another administrator account):
   ```sql
   CONNECT SYSTEM/your_system_password;
   ```
3. Create the `MediCore` database user and grant the necessary permissions:
   ```sql
   CREATE USER MediCore IDENTIFIED BY MediCore;
   GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE TRIGGER, CREATE SEQUENCE TO MediCore;
   ALTER USER MediCore QUOTA UNLIMITED ON USERS;
   ```
4. Connect as the new `MediCore` user:
   ```sql
   CONNECT MediCore/MediCore;
   ```
5. Run the SQL scripts in the following order:
   - **Step 1: Schema creation**
     ```sql
     @/path/to/project/database/schema.sql;
     ```
   - **Step 2: Stored procedures and triggers**
     ```sql
     @/path/to/project/database/plsql.sql;
     ```
   - **Step 3: Database updates and admin initialization**
     ```sql
     @/path/to/project/database/update_db.sql;
     ```

---

## 2. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following contents:
   ```env
   PORT=5000
   DB_USER=MediCore
   DB_PASSWORD=MediCore
   DB_CONNECTION_STRING=localhost:1521/XE
   JWT_SECRET=supersecretjwtkey123
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will be running on `http://localhost:5000`.

---

## 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the client dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will be running on `http://localhost:3000`.

---

## 4. Default Login Credentials

After setting up the database and starting both servers, you can log in as an administrator to begin adding departments, doctors, and configuring the hospital:

- **Role**: Admin
- **Username**: `admin`
- **Password**: `admin123`
