-- 1. Create FINANCIAL_LEDGER table
CREATE TABLE medicore.financial_ledger (
    ledger_id NUMBER NOT NULL,
    transaction_type VARCHAR2(50) NOT NULL, -- 'Appointment' or 'Lab Test'
    reference_id NUMBER NOT NULL, -- Appointment_ID or Record_ID
    patient_id NUMBER NOT NULL,
    doctor_id NUMBER, -- the doctor associated (who gets commission)
    total_amount NUMBER(10, 2) NOT NULL,
    doctor_amount NUMBER(10, 2) NOT NULL,
    admin_amount NUMBER(10, 2) NOT NULL,
    transaction_date DATE DEFAULT sysdate
)
PCTFREE 10
PCTUSED 40
TABLESPACE system
LOGGING;

ALTER TABLE medicore.financial_ledger
    ADD CONSTRAINT financial_ledger_pk
        PRIMARY KEY ( ledger_id )
            USING INDEX PCTFREE 10 INITRANS 2 TABLESPACE system
LOGGING;

-- Create Sequence and Trigger for FINANCIAL_LEDGER
CREATE SEQUENCE medicore.ledger_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER medicore.trg_ledger_id BEFORE
    INSERT ON medicore.financial_ledger
    FOR EACH ROW
    WHEN ( new.ledger_id IS NULL )
BEGIN
    :new.ledger_id := medicore.ledger_seq.nextval;
END;
/

-- 2. Alter LAB_TEST_RECORD table to add tracking for payments and commission waivers
ALTER TABLE medicore.lab_test_record
    ADD payment_status VARCHAR2(20 BYTE) DEFAULT 'Unpaid';

ALTER TABLE medicore.lab_test_record
    ADD waive_commission VARCHAR2(1 BYTE) DEFAULT 'N';

-- 3. We also need to add payment tracking to Appointment? 
-- The user says "appointments feature should be working", and dummy sslcommerz will be used when booking.
-- If the appointment is inserted ONLY upon successful dummy payment, we don't strictly need a payment_status,
-- because existence of appointment means it is paid. Same for lab test, but lab test is inserted by Doctor, 
-- and Patient pays later, so we need Payment_Status for Lab Test.

-- Ensure the ledger is linked to doctor and patient
ALTER TABLE medicore.financial_ledger
    ADD CONSTRAINT fk_ledger_doc
        FOREIGN KEY ( doctor_id )
            REFERENCES medicore.doctor ( doctor_id )
            ON DELETE SET NULL
            NOT DEFERRABLE;

ALTER TABLE medicore.financial_ledger
    ADD CONSTRAINT fk_ledger_pat
        FOREIGN KEY ( patient_id )
            REFERENCES medicore.patient ( patient_id )
            ON DELETE SET NULL
            NOT DEFERRABLE;
