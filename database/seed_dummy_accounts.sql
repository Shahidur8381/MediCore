-- Disable foreign key constraints temporarily if needed, or delete in correct order
DELETE FROM medicore.user_account;
DELETE FROM medicore.prescription;
DELETE FROM medicore.appointment;
DELETE FROM medicore.lab_test_record;
DELETE FROM medicore.payment;
DELETE FROM medicore.bill;
DELETE FROM medicore.admission;
DELETE FROM medicore.emergency_queue;
DELETE FROM medicore.doctor;
DELETE FROM medicore.patient;
DELETE FROM medicore.department;

-- Insert Admin Account
INSERT INTO medicore.user_account (user_id, username, password_hash, role, status, created_date)
VALUES (100, 'admin', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Admin', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

-- Insert Dummy Department
INSERT INTO medicore.department (department_id, department_name, department_head)
VALUES (100, 'General Medicine', 'Dr. Smith');

-- ==========================================
-- Insert 5 Dummy Doctors
-- ==========================================
-- Doctor 1
INSERT INTO medicore.doctor (doctor_id, department_id, name, gender, phone, email, consultation_fee, joining_date, status)
VALUES (101, 100, 'Doctor 1', 'Male', '555-0101', 'doctor1@medicore.com', 500, TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, doctor_id, username, password_hash, role, status, created_date)
VALUES (101, 101, 'Doctor1', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Doctor', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

-- Doctor 2
INSERT INTO medicore.doctor (doctor_id, department_id, name, gender, phone, email, consultation_fee, joining_date, status)
VALUES (102, 100, 'Doctor 2', 'Female', '555-0102', 'doctor2@medicore.com', 500, TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, doctor_id, username, password_hash, role, status, created_date)
VALUES (102, 102, 'Doctor2', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Doctor', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

-- Doctor 3
INSERT INTO medicore.doctor (doctor_id, department_id, name, gender, phone, email, consultation_fee, joining_date, status)
VALUES (103, 100, 'Doctor 3', 'Male', '555-0103', 'doctor3@medicore.com', 500, TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, doctor_id, username, password_hash, role, status, created_date)
VALUES (103, 103, 'Doctor3', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Doctor', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

-- Doctor 4
INSERT INTO medicore.doctor (doctor_id, department_id, name, gender, phone, email, consultation_fee, joining_date, status)
VALUES (104, 100, 'Doctor 4', 'Female', '555-0104', 'doctor4@medicore.com', 500, TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, doctor_id, username, password_hash, role, status, created_date)
VALUES (104, 104, 'Doctor4', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Doctor', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

-- Doctor 5
INSERT INTO medicore.doctor (doctor_id, department_id, name, gender, phone, email, consultation_fee, joining_date, status)
VALUES (105, 100, 'Doctor 5', 'Male', '555-0105', 'doctor5@medicore.com', 500, TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, doctor_id, username, password_hash, role, status, created_date)
VALUES (105, 105, 'Doctor5', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Doctor', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));


-- ==========================================
-- Insert 5 Dummy Patients
-- ==========================================
-- Patient 1
INSERT INTO medicore.patient (patient_id, name, gender, phone, email, registration_date, status)
VALUES (201, 'Patient 1', 'Male', '555-0201', 'patient1@medicore.com', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, patient_id, username, password_hash, role, status, created_date)
VALUES (201, 201, 'Patient1', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Patient', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

-- Patient 2
INSERT INTO medicore.patient (patient_id, name, gender, phone, email, registration_date, status)
VALUES (202, 'Patient 2', 'Female', '555-0202', 'patient2@medicore.com', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, patient_id, username, password_hash, role, status, created_date)
VALUES (202, 202, 'Patient2', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Patient', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

-- Patient 3
INSERT INTO medicore.patient (patient_id, name, gender, phone, email, registration_date, status)
VALUES (203, 'Patient 3', 'Male', '555-0203', 'patient3@medicore.com', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, patient_id, username, password_hash, role, status, created_date)
VALUES (203, 203, 'Patient3', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Patient', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

-- Patient 4
INSERT INTO medicore.patient (patient_id, name, gender, phone, email, registration_date, status)
VALUES (204, 'Patient 4', 'Female', '555-0204', 'patient4@medicore.com', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, patient_id, username, password_hash, role, status, created_date)
VALUES (204, 204, 'Patient4', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Patient', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

-- Patient 5
INSERT INTO medicore.patient (patient_id, name, gender, phone, email, registration_date, status)
VALUES (205, 'Patient 5', 'Male', '555-0205', 'patient5@medicore.com', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'), 'Active');

INSERT INTO medicore.user_account (user_id, patient_id, username, password_hash, role, status, created_date)
VALUES (205, 205, 'Patient5', '$2b$10$snyUAIAGmA9WYniWwzRnre8ReuMwcCl0Wy0j07x.auj6fAdakcsyq', 'Patient', 'Active', TO_DATE('21-JUN-2026', 'DD-MON-YYYY'));

COMMIT;
