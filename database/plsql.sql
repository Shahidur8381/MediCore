

-- 1. Trigger to update BED status on ADMISSION
CREATE OR REPLACE TRIGGER trg_update_bed_status
AFTER INSERT OR UPDATE ON ADMISSION
FOR EACH ROW
BEGIN
    IF INSERTING AND :NEW.Status = 'Admitted' THEN
        UPDATE BED SET Status = 'Occupied' WHERE Bed_ID = :NEW.Bed_ID;
    ELSIF UPDATING AND :NEW.Status = 'Discharged' AND :OLD.Status = 'Admitted' THEN
        UPDATE BED SET Status = 'Available' WHERE Bed_ID = :NEW.Bed_ID;
    END IF;
END;
/

-- 2. Procedure to generate a final bill for a patient given admission and appts up to current date
CREATE OR REPLACE PROCEDURE GENERATE_FINAL_BILL (
    p_patient_id IN NUMBER,
    p_discount IN NUMBER DEFAULT 0,
    o_bill_id OUT NUMBER
)
AS
    v_total_amount NUMBER := 0;
    v_room_charge NUMBER := 0;
    v_appt_fee NUMBER := 0;
    v_lab_fee NUMBER := 0;
BEGIN
    SELECT NVL(SUM(d.Consultation_Fee), 0)
    INTO v_appt_fee
    FROM APPOINTMENT a
    JOIN DOCTOR d ON a.Doctor_ID = d.Doctor_ID
    WHERE a.Patient_ID = p_patient_id AND a.Status = 'Completed'
    AND NOT EXISTS (SELECT 1 FROM BILL WHERE Patient_ID = p_patient_id AND Status != 'Unpaid');

    SELECT NVL(SUM(t.Test_Fee), 0)
    INTO v_lab_fee
    FROM LAB_TEST_RECORD l
    JOIN LAB_TEST t ON l.Test_ID = t.Test_ID
    WHERE l.Patient_ID = p_patient_id AND l.Status = 'Completed'
    AND NOT EXISTS (SELECT 1 FROM BILL WHERE Patient_ID = p_patient_id AND Status != 'Unpaid');

    FOR r IN (
        SELECT * FROM (
            SELECT r.Daily_Charge, a.Admission_Date, a.Discharge_Date
            FROM ADMISSION a
            JOIN ROOM r ON a.Room_ID = r.Room_ID
            WHERE a.Patient_ID = p_patient_id AND a.Status = 'Discharged'
            ORDER BY a.Admission_Date DESC
        ) WHERE ROWNUM <= 1
    ) LOOP
        v_room_charge := r.Daily_Charge * GREATEST(1, CEIL(r.Discharge_Date - r.Admission_Date));
    END LOOP;

    v_total_amount := v_appt_fee + v_lab_fee + v_room_charge;

    INSERT INTO BILL (Patient_ID, Bill_Date, Total_Amount, Discount, Net_Amount, Status)
    VALUES (p_patient_id, SYSDATE, v_total_amount, p_discount, GREATEST(0, v_total_amount - p_discount), 'Unpaid')
    RETURNING Bill_ID INTO o_bill_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- 3. Trigger to validate appointment slot
CREATE OR REPLACE TRIGGER trg_validate_appointment
BEFORE INSERT OR UPDATE ON APPOINTMENT
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM APPOINTMENT
    WHERE Doctor_ID = :NEW.Doctor_ID
      AND Appointment_Date = :NEW.Appointment_Date
      AND Appointment_Time = :NEW.Appointment_Time
      AND Status IN ('Pending', 'Confirmed')
      AND Appointment_ID != NVL(:NEW.Appointment_ID, -1);
      
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Doctor already has an appointment at this date and time.');
    END IF;
END;
/
