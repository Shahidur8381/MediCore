

ALTER TABLE USER_ACCOUNT ADD Patient_ID NUMBER NULL;
ALTER TABLE USER_ACCOUNT ADD CONSTRAINT fk_usr_pat FOREIGN KEY (Patient_ID) REFERENCES PATIENT(Patient_ID) ON DELETE SET NULL;

-- The bcrypt hash for 'admin123' is $2a$10$8.w1N30rXJ69oY1ZzB55LeB6M3P0FvX/6XzW8KxkR/T48fP746uEG

INSERT INTO USER_ACCOUNT (Username, Password_Hash, Role, Status) 
VALUES ('admin', '$2b$10$SF6UYB7KHiPMi9uvAfHe1.EmnxAsr0GawydKOkB9OCMIXxa3wxsUq', 'Admin', 'Active');

-- Seed Lab Tests for Phase 3
INSERT INTO LAB_TEST (Test_Name, Description, Test_Fee) VALUES ('Complete Blood Count (CBC)', 'General health check', 50.00);
INSERT INTO LAB_TEST (Test_Name, Description, Test_Fee) VALUES ('Basic Metabolic Panel (BMP)', 'Measures glucose, calcium, and electrolytes', 45.00);
INSERT INTO LAB_TEST (Test_Name, Description, Test_Fee) VALUES ('Lipid Panel', 'Measures cholesterol levels', 60.00);
INSERT INTO LAB_TEST (Test_Name, Description, Test_Fee) VALUES ('X-Ray (Chest)', 'Radiology test for chest', 120.00);
INSERT INTO LAB_TEST (Test_Name, Description, Test_Fee) VALUES ('Urinalysis', 'Check for signs of disease in urine', 30.00);

COMMIT;
