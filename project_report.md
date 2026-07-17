# MediCore — Project Report

## System Overview
MediCore is a multi-role hospital management system built with:
- **Frontend**: Next.js 14 (TypeScript), Tailwind-free Vanilla CSS, Lucide icons
- **Backend**: Node.js + Express.js REST API
- **Database**: Oracle XE (11g compatible, Thick mode)

---

## User Roles & Credentials

| Role | Username | Password | Dashboard URL |
|------|----------|----------|---------------|
| Admin | `admin` | `admin123` | `/dashboard/admin` |
| Doctor | *(created by admin)* | *(set by admin)* | `/dashboard/doctor` |
| Patient | *(self-register)* | *(set at register)* | `/dashboard/patient` |
| **Lab** | `lab` | `lab123` | `/dashboard/lab` |

---

## Database Schema Overview

```
USER_ACCOUNT ──┬── DOCTOR ──┬── DEPARTMENT
               └── PATIENT   └── APPOINTMENT (Queue-based)
                                     │
                             PRESCRIPTION ───► APPOINTMENT

LAB_TEST ──────► LAB_TEST_RECORD ──────────────────────────────┐
                    │ Payment_Status: Pending → Paid            │
                    │ Status: Pending → Awaiting Result → Completed│
                    └──────────────────────────────────────────►

FINANCIAL_LEDGER ◄── (Appointment payment 80/20) 
                 ◄── (Lab test payment 25/75 or 0/100 if waived)
```

### Key Tables
- **APPOINTMENT**: `Appointment_ID`, `Patient_ID`, `Doctor_ID`, `Appointment_Date`, `Queue_Number`, `Status`
- **LAB_TEST_RECORD**: `Record_ID`, `Patient_ID`, `Doctor_ID`, `Test_ID`, `Payment_Status`, `Waive_Commission`, `Status`, `Result_Details`, `Report_Date`
- **FINANCIAL_LEDGER**: `Ledger_ID`, `Transaction_Type`, `Reference_ID`, `Patient_ID`, `Doctor_ID`, `Total_Amount`, `Doctor_Amount`, `Admin_Amount`, `Transaction_Date`

---

## Feature Walkthroughs

### 1. Queue-Based Appointment Booking (Patient)
1. Log in as **Patient**.
2. Go to **"Book Appointment"**.
3. Select a Department → Doctor → Date.
4. Click **"Continue to Payment"** → Dummy SSLCommerz modal appears.
5. Enter any card details (e.g., `4242 4242 4242 4242`, `12/25`, `123`) → Pay.
6. System auto-assigns a **Queue Number** (e.g., "You are Queue #3") for that doctor on that date.
7. Appointment is listed with the queue number, not a time slot.

> **No two patients can share the same doctor on the same date with conflicting time slots.** The queue system assigns positions sequentially.

---

### 2. Doctor: Confirm & Consult
1. Log in as **Doctor**.
2. Go to **"My Schedule"**. Appointments are grouped by date and show queue numbers.
3. **Pending** appointments show two buttons: **Confirm** and **Cancel**.
4. Click **Confirm** to accept the appointment.
5. Now a **Start Consult** button appears.
6. Click **Start Consult** → goes to the Consultation page.

---

### 3. Doctor Consultation: Prescription + Multiple Lab Tests
On the consultation page:
- **Write a Prescription** (Diagnosis, Medicines, Notes).
- **Order Lab Tests**: Select from the dropdown, optionally check "Waive my 25% commission", click **Add Test** — you can add **multiple tests**.
- All ordered tests appear in the "Ordered Tests" panel on the right.
- **Two completion options**:
  - **"Wait for Lab Results"** — marks appointment as `Waiting`, doctor can resume later. Only enabled if there are pending lab tests.
  - **"Complete Consultation"** — saves prescription and marks appointment as `Completed`.

---

### 4. Patient Pays Lab Test Fee
1. Log in as **Patient** → **Lab Results**.
2. Tests ordered by the doctor appear with **"Unpaid"** status.
3. Click **"Pay ৳[amount]"** → Dummy SSLCommerz.
4. After payment, status changes to **"Lab Processing"** (Awaiting Result).
5. Financial ledger is updated with the 25/75 split (or 0/100 if doctor waived).

---

### 5. Lab Panel: Process & Submit Report
1. Log in as **Lab** (`lab` / `lab123`).
2. The **Laboratory Panel** shows all paid tests awaiting results.
3. Click **"Enter Report"** to expand a panel with a text area.
4. Type the test results in detail.
5. Click **"Submit Report"** → test status changes to `Completed`.

---

### 6. Patient Views Lab Report
1. Log in as **Patient** → **Lab Results**.
2. Completed tests show a **"Report Ready"** badge.
3. Click **"View Report"** to expand and read the full result.

---

### 7. Doctor Follow-up (Resume from Waiting)
1. Once the lab report is done, go to **Doctor → My Schedule**.
2. The appointment now shows a **"Resume"** button (status: Waiting).
3. Click Resume → complete the consultation with a prescription.

---

### 8. Admin Financial Tracking
1. Log in as **Admin** (`admin` / `admin123`).
2. Click **"Financial Tracking"** in the sidebar.
3. View aggregated summary cards:
   - Total Revenue
   - Hospital (Admin) Earnings
   - Doctor Earnings
4. Full transaction ledger table below.

---

## Financial Logic

| Transaction | Total | Doctor Gets | Admin Gets |
|------------|-------|-------------|-----------|
| Appointment | ৳X | ৳X × 80% | ৳X × 20% |
| Lab Test (normal) | ৳X | ৳X × 25% | ৳X × 75% |
| Lab Test (waived) | ৳X | ৳0 | ৳X × 100% |

---

## Commit History (Key Milestones)
1. **Initial setup** — Next.js frontend + Express backend + Oracle connection
2. **Auth system** — JWT login/register for Patient, Doctor, Admin
3. **Currency change** — BDT (৳) globally
4. **Financial schema** — FINANCIAL_LEDGER table, sequences, triggers
5. **Financial backend** — Appointment 80/20 and Lab 25/75 splits
6. **Payment UI** — DummySSLCommerz gateway component
7. **Fix: drop mutating trigger** — ORA-04091 resolved
8. **Queue system + Lab role** — DB migration, new Lab user
9. **Full feature update** — Lab panel, dynamic dashboards, multiple lab orders, queue appointments
