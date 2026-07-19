# MediCore - Hospital Management System

MediCore is a comprehensive, full-stack hospital management system designed to handle the core workflows of a clinical environment. It provides tailored dashboards and functionalities for Administrators, Doctors, Patients, and Lab Technicians.

---

## 🛠 Tech Stack

### Frontend
*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS (with dynamic glassmorphism and modern aesthetics)
*   **Icons:** Lucide React
*   **State Management:** React Context API
*   **Routing:** Next.js App Router

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database Driver:** `oracledb`
*   **Authentication:** JWT (JSON Web Tokens)
*   **Security:** bcrypt (for secure password hashing), CORS

### Database
*   **RDBMS:** Oracle Database 11g
*   **Schema:** Custom relational schema (9 core tables) handling appointments, lab tests, prescriptions, financial ledgers, and user accounts.

---

## 🚀 Getting Started (A to Z Guide)

Follow these steps to clone, set up, and run MediCore on your local machine.

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [Git](https://git-scm.com/)
*   [Oracle Database 11g](https://www.oracle.com/database/technologies/xe-prior-release-downloads.html) (Express Edition is fine)
*   Oracle SQL Developer (for running database scripts)

### 2. Clone the Repository
Open your terminal and clone the repository:
```bash
git clone https://github.com/Shahidur8381/MediCore
cd MediCore
```

### 3. Database Setup
You need to create the database schema and insert the dummy data.

1. Open **Oracle SQL Developer** and connect as the `SYSTEM` or `SYS` admin user.
2. Open the file located at `database/FULL DDL.sql`.
3. Run the entire script. This will create the `medicore` user, grant necessary permissions, create the tables, and set up all triggers and sequences.
4. Open a new connection in SQL Developer logging in as the new user:
   *   **Username:** `MediCore`
   *   **Password:** `MediCore`
5. Open the file located at `database/seed_dummy_data.sql`.
6. Run the script against the `MediCore` connection. This populates the database with admin, doctors, patients, a lab technician, and predefined lab tests.

### 4. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (if not already present) and configure your environment variables. It should look like this (matching your Oracle setup):
   ```env
   PORT=5000
   DB_USER=MediCore
   DB_PASSWORD=MediCore
   DB_CONNECTION_STRING=localhost:1521/XE
   ```
   *(Adjust these values to match the credentials you used in SQL Developer).*
4. Start the backend server (using nodemon for development):
   ```bash
   npm run dev
   ```
   You should see a message indicating the server is running on port 5000.

### 5. Frontend Setup
1. Open a **new** terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 6. Accessing the Application
Open your browser and navigate to:
**http://localhost:3000**

You can use the following default dummy credentials to test the different panels:

*   **Admin Panel:**
    *   Username: `admin`
    *   Password: `MediCore`
*   **Doctor Panel:**
    *   Username: `Doctor1` (up to `Doctor5`)
    *   Password: `MediCore`
*   **Patient Panel:**
    *   Username: `Patient1` (up to `Patient5`)
    *   Password: `MediCore`
*   **Lab Panel:**
    *   Username: `lab`
    *   Password: `MediCore`

---

## ✨ Features
*   **Role-based Access Control:** Secure JWT authentication routing users to their specific dashboards.
*   **Appointment Management:** Patients can book appointments; doctors can manage their queues.
*   **Digital Prescriptions:** Doctors can generate prescriptions with diagnoses and medications.
*   **Lab Test Workflow:** Doctors order tests -> Patients pay -> Lab processes & uploads results.
*   **Financial Ledger:** Tracks payments, splits commissions between the hospital (admin) and doctors.
