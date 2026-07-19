# MediCore Hospital Management System: Complete Architecture & Database Workflow Report

## Table of Contents
1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [Global System Architecture](#2-global-system-architecture)
3. [Database Schema & Data Dictionary](#3-database-schema--data-dictionary)
4. [PL/SQL Constructs: Sequences & Triggers](#4-plsql-constructs-sequences--triggers)
5. [Detailed Workflow: Authentication & Authorization](#5-detailed-workflow-authentication--authorization)
6. [Detailed Workflow: Appointment Booking & Queue Management](#6-detailed-workflow-appointment-booking--queue-management)
7. [Detailed Workflow: Consultation & Prescription Generation](#7-detailed-workflow-consultation--prescription-generation)
8. [Detailed Workflow: Laboratory Test Lifecycle & Billing](#8-detailed-workflow-laboratory-test-lifecycle--billing)
9. [Detailed Workflow: Financial Ledger & Revenue Tracking](#9-detailed-workflow-financial-ledger--revenue-tracking)
10. [Frontend Integration: State Management & Routing](#10-frontend-integration-state-management--routing)
11. [Security Considerations](#11-security-considerations)

---

## 1. Executive Summary & Purpose

MediCore is a comprehensive, full-stack Hospital Management System (HMS) developed to digitize, automate, and streamline the core operational workflows of a modern healthcare facility. 

The primary purpose of this detailed report is to serve as the definitive technical reference for developers, database administrators, and system architects maintaining or extending the MediCore application. It goes far beyond a simple setup guide, delving deep into the specific database queries, the relational architecture, the Node.js backend logic, and the exact sequence of events that occur when users interact with the system.

This document specifically focuses on **"Database Traversal"**—tracing exactly how data moves from the Next.js frontend, through the Express.js API layer, and into the highly structured Oracle 11g relational database.

---

## 2. Global System Architecture

MediCore operates on a standard 3-tier architecture, ensuring separation of concerns, security, and scalability.

### 2.1 The Presentation Tier (Frontend)
*   **Technology:** Next.js (React), Tailwind CSS.
*   **Responsibility:** Renders the User Interface (UI), manages local client state (using React Context), handles routing, and strictly protects views based on user roles (Admin, Doctor, Patient, Lab).
*   **Communication:** Uses `axios` to send asynchronous HTTP requests (GET, POST, PUT, DELETE) to the backend API.

### 2.2 The Application Tier (Backend)
*   **Technology:** Node.js, Express.js.
*   **Responsibility:** Acts as the middleman. It intercepts HTTP requests, validates JWT tokens for authentication, enforces business logic (like calculating commission splits or generating queue numbers), and executes SQL queries.
*   **Module Structure:** Divided into `routes` (URL mapping), `controllers` (business logic), and `middleware` (security/interception).

### 2.3 The Data Tier (Database)
*   **Technology:** Oracle Database 11g.
*   **Responsibility:** Provides persistent, ACID-compliant data storage. It utilizes sequences and triggers to auto-generate primary keys, enforces relational constraints (Foreign Keys), and handles Large Objects (CLOB) for extensive text data.

---

## 3. Database Schema & Data Dictionary

The MediCore database is highly normalized, consisting of exactly 9 core tables designed to handle the hospital's workflows without redundancy.

### 3.1 `USER_ACCOUNT` Table
This is the gateway to the system. Every entity that logs in must have a record here.
*   `User_ID` (NUMBER, PK): Unique identifier.
*   `Username` (VARCHAR2, UNIQUE): The login handle.
*   `Password_Hash` (VARCHAR2): A bcrypt hashed string. Plain text passwords are NEVER stored.
*   `Role` (VARCHAR2): Determines authorization level (`Admin`, `Doctor`, `Patient`, `Lab`).
*   `Patient_ID` (NUMBER, FK): Links to the PATIENT table (if applicable).
*   `Doctor_ID` (NUMBER, FK): Links to the DOCTOR table (if applicable).

### 3.2 `PATIENT` Table
Stores demographic and contact information for patients.
*   `Patient_ID` (NUMBER, PK).
*   `Name`, `Gender`, `Date_Of_Birth`, `Blood_Group`.
*   `Phone` (VARCHAR2, UNIQUE), `Email`.
*   `Emergency_Contact`.

### 3.3 `DOCTOR` Table
Stores physician details, specializations, and fee structures.
*   `Doctor_ID` (NUMBER, PK).
*   `Department_ID` (NUMBER, FK): Links to the DEPARTMENT table.
*   `Name`, `Gender`, `Specialization`, `Qualification`.
*   `Consultation_Fee` (NUMBER): Extremely crucial for the financial ledger calculation.

### 3.4 `DEPARTMENT` Table
A simple lookup table categorizing doctors.
*   `Department_ID` (NUMBER, PK).
*   `Department_Name` (VARCHAR2, UNIQUE).
*   `Department_Head` (VARCHAR2).

### 3.5 `APPOINTMENT` Table
The bridge between patients and doctors.
*   `Appointment_ID` (NUMBER, PK).
*   `Patient_ID` (NUMBER, FK).
*   `Doctor_ID` (NUMBER, FK).
*   `Appointment_Date` (DATE): The day the patient is visiting.
*   `Queue_Number` (NUMBER): Dynamically calculated position for that day.
*   `Status` (VARCHAR2): 'Pending' or 'Completed'.

### 3.6 `PRESCRIPTION` Table
The medical output of an appointment.
*   `Prescription_ID` (NUMBER, PK).
*   `Appointment_ID` (NUMBER, FK).
*   `Diagnosis` (VARCHAR2).
*   `Medicines` (CLOB): A Character Large Object to hold extensive, unstructured medical directives.
*   `Notes` (CLOB).

### 3.7 `LAB_TEST` Table
The catalog of available diagnostic tests offered by the hospital.
*   `Test_ID` (NUMBER, PK).
*   `Test_Name`, `Description`.
*   `Test_Fee` (NUMBER).

### 3.8 `LAB_TEST_RECORD` Table
Tracks a specific instance of a patient taking a test.
*   `Record_ID` (NUMBER, PK).
*   `Patient_ID` (NUMBER, FK).
*   `Doctor_ID` (NUMBER, FK): The doctor who ordered the test (receives commission).
*   `Test_ID` (NUMBER, FK).
*   `Payment_Status` (VARCHAR2): 'Unpaid' or 'Paid'.
*   `Status` (VARCHAR2): 'Pending' (waiting on lab tech) or 'Completed'.
*   `Result_Details` (CLOB): The actual laboratory findings.
*   `Waive_Commission` (VARCHAR2): 'Y' or 'N'. Allows doctors to waive their cut for charity cases.

### 3.9 `FINANCIAL_LEDGER` Table
The single source of truth for hospital revenue.
*   `Ledger_ID` (NUMBER, PK).
*   `Transaction_Type` (VARCHAR2): 'Appointment' or 'Lab Test'.
*   `Reference_ID` (NUMBER): Links back to either `Appointment_ID` or `Record_ID`.
*   `Total_Amount` (NUMBER).
*   `Doctor_Amount` (NUMBER): The doctor's commission (e.g., 80%).
*   `Admin_Amount` (NUMBER): The hospital's cut (e.g., 20%).
*   `Is_Cleared` (VARCHAR2): Defaults to 'N'. Used by accounting to track if the doctor has been physically paid out.

---

## 4. PL/SQL Constructs: Sequences & Triggers

Oracle Database 11g does not natively support `AUTO_INCREMENT` or `IDENTITY` columns in the same way MySQL or PostgreSQL do. To solve this, MediCore utilizes **Sequences** and **Before Insert Triggers**.

For every table, there is a sequence and a corresponding trigger.

**Example: The Appointment Table**

1.  **The Sequence:** Generates numbers sequentially.
    ```sql
    CREATE SEQUENCE medicore.apt_seq START WITH 1 NOCACHE ORDER;
    ```

2.  **The Trigger:** Fires automatically right before a new row is inserted. It checks if an `appointment_id` was provided. If not, it fetches the next number from the sequence and assigns it to the row.
    ```sql
    CREATE OR REPLACE TRIGGER medicore.trg_apt_id BEFORE
        INSERT ON medicore.appointment
        FOR EACH ROW
        WHEN ( new.appointment_id IS NULL )
    BEGIN
        :new.appointment_id := medicore.apt_seq.nextval;
    END;
    /
    ```
This architecture guarantees that Primary Keys are always unique and safely generated at the database level, preventing race conditions if multiple users book appointments at the exact same millisecond.

---

## 5. Detailed Workflow: Authentication & Authorization
**File References:** `backend/controllers/authController.js`, `backend/middleware/authMiddleware.js`

Authentication in MediCore is strictly stateless, utilizing JSON Web Tokens (JWT).

### 5.1 The Login Lifecycle
1.  **The Request:** The user submits their `username` and `password` via the Next.js login form. A POST request is sent to `/api/auth/login`.
2.  **Database Lookup:** The `authController.js` executes the following query:
    ```sql
    SELECT * FROM USER_ACCOUNT WHERE Username = :username
    ```
3.  **Password Verification:** If the user exists, the controller extracts the `Password_Hash`. It uses the `bcryptjs` library to compare the plaintext password provided by the user against the hash.
    ```javascript
    const isMatch = await bcrypt.compare(password, user.PASSWORD_HASH);
    ```
4.  **Token Generation:** If the password matches, a JWT payload is constructed:
    ```javascript
    const payload = {
        userId: user.USER_ID,
        role: user.ROLE,
        patientId: user.PATIENT_ID,
        doctorId: user.DOCTOR_ID
    };
    ```
    This payload is signed using a secret key (from `.env` or the default fallback) and an expiration time (e.g., '24h').
5.  **The Response:** The token is returned to the frontend, where it is typically stored in `localStorage`.

### 5.2 The Authorization Middleware
To access protected routes (like viewing a patient's medical history), the frontend must attach the JWT to the `Authorization` HTTP header.

The `authMiddleware.js` file intercepts these requests before they hit the controller.
1.  It checks for the presence of the token.
2.  It verifies the token signature using the secret key.
3.  If valid, it decrypts the payload and attaches it to the `req` object (`req.user = decoded`).
4.  It calls `next()` to pass control to the controller.

This prevents unauthorized access at the network layer and allows controllers to instantly know who is making the request without writing redundant SQL queries to check roles.

---

## 6. Detailed Workflow: Appointment Booking & Queue Management
**File References:** `backend/controllers/appointmentController.js`

This workflow is triggered when a patient selects a doctor and a date.

### 6.1 Queue Number Calculation
To ensure patients are seen in an orderly fashion, MediCore assigns a queue number for the specific day.
The `appointmentController` executes an aggregate query to find the highest existing queue number for that doctor on that date:

```sql
SELECT NVL(MAX(Queue_Number), 0) + 1 AS Next_Queue
FROM APPOINTMENT 
WHERE Doctor_ID = :doctorId 
AND TRUNC(Appointment_Date) = TO_DATE(:date, 'YYYY-MM-DD')
```
*   `NVL` handles the edge case where no appointments exist yet (returns 0, which becomes 1).
*   `TRUNC` ensures that time formatting doesn't interfere with date matching.

### 6.2 Insertion and Transaction Atomicity
Once the `Next_Queue` is calculated, the system inserts the appointment:

```sql
INSERT INTO APPOINTMENT (Patient_ID, Doctor_ID, Appointment_Date, Queue_Number) 
VALUES (:patientId, :doctorId, TO_DATE(:date, 'YYYY-MM-DD'), :queue)
RETURNING Appointment_ID INTO :id
```

### 6.3 Immediate Financial Ledger Update
Because MediCore operates on a prepaid consultation model, the financial ledger is updated in the exact same transaction block.

1.  The system queries the `DOCTOR` table to fetch the `Consultation_Fee`.
2.  It calculates the split:
    ```javascript
    const totalAmount = doctorFee;
    const adminAmount = totalAmount * 0.20; // 20% hospital cut
    const doctorAmount = totalAmount * 0.80; // 80% doctor earnings
    ```
3.  It pushes this data to the ledger:
    ```sql
    INSERT INTO FINANCIAL_LEDGER 
    (Transaction_Type, Reference_ID, Patient_ID, Doctor_ID, Total_Amount, Doctor_Amount, Admin_Amount) 
    VALUES ('Appointment', :aptId, :patientId, :doctorId, :total, :docCut, :adminCut)
    ```

---

## 7. Detailed Workflow: Consultation & Prescription Generation
**File References:** `backend/controllers/prescriptionController.js`

When a patient physically visits the doctor, the doctor opens the consultation interface.

### 7.1 Fetching Patient History
The doctor's dashboard fires an API request to load the patient's past prescriptions and lab records. The backend joins multiple tables to provide a comprehensive view:

```sql
SELECT p.Prescription_ID, p.Prescription_Date, p.Diagnosis, p.Medicines, p.Notes, d.Name AS Doctor_Name
FROM PRESCRIPTION p
JOIN DOCTOR d ON p.Doctor_ID = d.Doctor_ID
WHERE p.Patient_ID = :patientId
ORDER BY p.Prescription_Date DESC
```

### 7.2 Oracle CLOB Handling
Oracle handles large text blocks differently than MySQL. In MediCore, `Medicines` and `Notes` are `CLOB` types. The Node.js `oracledb` driver returns these as stream objects by default.
The backend must convert these streams to strings before sending JSON to the frontend. The `prescriptionController` carefully manages this to prevent memory leaks and ensure the frontend receives parseable text.

### 7.3 Finalizing the Prescription
When the doctor hits "Save Prescription":
1.  The `APPOINTMENT` table is updated (`Status = 'Completed'`).
2.  The `PRESCRIPTION` table receives a new row.
    ```sql
    INSERT INTO PRESCRIPTION (Appointment_ID, Patient_ID, Doctor_ID, Diagnosis, Medicines, Notes) 
    VALUES (:aptId, :patientId, :doctorId, :diagnosis, :medicines, :notes)
    ```

---

## 8. Detailed Workflow: Laboratory Test Lifecycle & Billing
**File References:** `backend/controllers/labController.js`

The laboratory module is the most complex relational workflow in MediCore, traversing three different user roles (Doctor, Patient, Lab).

### 8.1 Phase 1: Doctor Orders Test
During consultation, the doctor prescribes tests.
```sql
INSERT INTO LAB_TEST_RECORD (Patient_ID, Doctor_ID, Test_ID, Waive_Commission) 
VALUES (:patientId, :doctorId, :testId, :waive)
```
At this stage:
*   `Status` = 'Pending'
*   `Payment_Status` = 'Unpaid'

### 8.2 Phase 2: Patient Payment & Commission Logic
The patient must log in and pay for their pending tests before the lab will process them. Upon successful payment simulation, the patient dashboard triggers the payment API.

1.  The system updates the record:
    ```sql
    UPDATE LAB_TEST_RECORD SET Payment_Status = 'Paid' WHERE Record_ID = :recordId
    ```
2.  The system calculates commissions. This is highly dynamic based on the `Waive_Commission` flag set by the doctor.
    ```javascript
    let doctorAmount = 0;
    let adminAmount = testFee; // Default: hospital gets 100%

    if (waiveCommission === 'N') {
        doctorAmount = testFee * 0.20; // Doctor gets 20% commission on tests they order
        adminAmount = testFee * 0.80;  // Hospital keeps 80%
    }
    ```
3.  The ledger is updated:
    ```sql
    INSERT INTO FINANCIAL_LEDGER (Transaction_Type, Reference_ID, Patient_ID, Doctor_ID, Total_Amount, Doctor_Amount, Admin_Amount) 
    VALUES ('Lab Test', :recordId, :patientId, :doctorId, :testFee, :doctorAmount, :adminAmount)
    ```

### 8.3 Phase 3: Result Upload (Lab Technician)
The lab technician logs into their dashboard, viewing only tests where `Payment_Status = 'Paid'` and `Status = 'Pending'`.
They perform the physical tests and submit the findings.
```sql
UPDATE LAB_TEST_RECORD 
SET Status = 'Completed', Result_Details = :details, Report_Date = SYSDATE 
WHERE Record_ID = :recordId
```

---

## 9. Detailed Workflow: Financial Ledger & Revenue Tracking
**File References:** `backend/controllers/adminController.js`, `backend/controllers/doctorController.js`

The `FINANCIAL_LEDGER` table acts as a strict, immutable accounting journal.

### 9.1 Hospital Revenue Analytics (Admin Panel)
The admin dashboard provides a bird's-eye view of hospital profitability. It executes aggregate SQL functions to sum the `Admin_Amount` column.
```sql
SELECT 
    SUM(CASE WHEN Transaction_Type = 'Appointment' THEN Admin_Amount ELSE 0 END) AS Total_Consultation_Revenue,
    SUM(CASE WHEN Transaction_Type = 'Lab Test' THEN Admin_Amount ELSE 0 END) AS Total_Lab_Revenue,
    SUM(Admin_Amount) AS Grand_Total
FROM FINANCIAL_LEDGER
```

### 9.2 Doctor Payout Tracking
Doctors have their own financial views to track their earnings from consultations and lab commissions.
```sql
SELECT Transaction_Type, Total_Amount, Doctor_Amount, Transaction_Date, Is_Cleared 
FROM FINANCIAL_LEDGER 
WHERE Doctor_ID = :doctorId
ORDER BY Transaction_Date DESC
```
The hospital accountant uses the `Is_Cleared` flag. At the end of the month, after issuing a physical paycheck or bank transfer to the doctor, they execute an update:
```sql
UPDATE FINANCIAL_LEDGER SET Is_Cleared = 'Y' WHERE Doctor_ID = :doctorId AND Is_Cleared = 'N'
```

---

## 10. Frontend Integration: State Management & Routing
**File References:** `frontend/src/context/AuthContext.tsx`, `frontend/src/lib/api.ts`

### 10.1 React Context API
To prevent passing user data down through deep component trees (prop drilling), MediCore uses the React Context API (`AuthContext`).
When a user logs in, the `AuthContext` decodes the JWT and stores the `user` object in a global state. Every component in the application (Navbars, Dashboards, Sidebar menus) can instantly access `user.role` or `user.username` via the `useAuth()` custom hook.

### 10.2 Axios Interceptors
To ensure that every API request is authenticated, `api.ts` configures an `axios` interceptor. 
Before any request leaves the browser, this interceptor automatically checks `localStorage` for the JWT token and attaches it to the `Authorization` header.
```javascript
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### 10.3 Route Protection
Next.js pages in the `dashboard` directory implement client-side protection logic. In the `useEffect` hook, the page checks if the user exists and if their role matches the required role for that page (e.g., `user.role !== 'Doctor'`). If they are unauthorized, they are immediately redirected (`router.push('/login')`).

---

## 11. Security Considerations

*   **SQL Injection Prevention:** The backend strictly uses Oracle Bind Variables (e.g., `:patientId`, `:password`) instead of string concatenation. The `oracledb` driver handles the sanitization, making SQL injection mathematically impossible through standard form inputs.
*   **XSS Prevention:** React natively escapes string variables rendered in the DOM, preventing Cross-Site Scripting attacks.
*   **Password Storage:** No plaintext passwords exist anywhere in the database or logs. The `bcrypt` hashing algorithm employs a variable salt, ensuring that even identical passwords result in different hashes, thwarting rainbow table attacks.

---
*End of Comprehensive Architecture & Workflow Report. Prepared for the MediCore Development Team.*
