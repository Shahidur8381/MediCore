



CREATE USER MediCore IDENTIFIED BY MediCore

unlock;

GRANT
    CREATE SESSION,
    BECOME USER,
    CREATE ROLLBACK SEGMENT,
    COMMENT ANY TABLE,
    INSERT ANY TABLE,
    DELETE ANY TABLE,
    CREATE ANY VIEW,
    CREATE SEQUENCE,
    ALTER ANY ROLE,
    FORCE ANY TRANSACTION,
    ALTER ANY INDEXTYPE,
    UNDER ANY VIEW,
    EXECUTE ANY INDEXTYPE,
    DEQUEUE ANY QUEUE,
    CREATE ANY OUTLINE,
    DROP ANY OUTLINE,
    DEBUG ANY PROCEDURE,
    DROP ANY SQL PROFILE,
    MANAGE FILE GROUP,
    EXECUTE ASSEMBLY,
    CREATE MEASURE FOLDER,
    DELETE ANY MEASURE FOLDER,
    ADMINISTER SQL MANAGEMENT OBJECT,
    UNLIMITED TABLESPACE,
    DROP USER,
    DROP ROLLBACK SEGMENT,
    DROP ANY VIEW,
    CREATE DATABASE LINK,
    DROP PUBLIC DATABASE LINK,
    CREATE ROLE,
    ALTER PROFILE,
    CREATE MATERIALIZED VIEW,
    CREATE TYPE,
    ALTER ANY TYPE,
    ALTER ANY LIBRARY,
    EXECUTE ANY OPERATOR,
    CREATE INDEXTYPE,
    DROP ANY INDEXTYPE,
    MANAGE ANY QUEUE,
    DROP ANY CONTEXT, resumable,
    EXECUTE ANY RULE SET,
    EXPORT FULL DATABASE,
    ALTER ANY SQL PROFILE,
    CHANGE NOTIFICATION,
    CREATE EXTERNAL JOB,
    ALTER ANY EDITION,
    CREATE ASSEMBLY,
    INSERT ANY CUBE DIMENSION,
    DROP ANY MEASURE FOLDER,
    DROP ANY CUBE BUILD PROCESS,
    RESTRICTED SESSION,
    DROP TABLESPACE,
    ALTER USER,
    DROP ANY CLUSTER,
    ALTER DATABASE,
    ALTER ANY PROCEDURE,
    GRANT ANY PRIVILEGE,
    DROP ANY MATERIALIZED VIEW,
    DROP ANY DIRECTORY,
    CREATE LIBRARY,
    QUERY REWRITE,
    CREATE ANY DIMENSION,
    ALTER ANY DIMENSION,
    ENQUEUE ANY QUEUE,
    ADMINISTER DATABASE TRIGGER,
    DROP ANY EVALUATION CONTEXT,
    EXECUTE ANY EVALUATION CONTEXT,
    IMPORT FULL DATABASE,
    ALTER ANY RULE,
    EXECUTE ANY RULE,
    EXECUTE ANY PROGRAM,
    EXECUTE ANY CLASS,
    MANAGE SCHEDULER,
    CREATE ANY SQL PROFILE,
    ALTER ANY ASSEMBLY,
    ALTER ANY MINING MODEL,
    CREATE CUBE DIMENSION,
    CREATE ANY CUBE DIMENSION,
    DROP ANY CUBE DIMENSION,
    CREATE CUBE BUILD PROCESS,
    CREATE ANY CUBE BUILD PROCESS,
    UPDATE ANY CUBE BUILD PROCESS,
    ALTER TABLESPACE,
    CREATE ANY TABLE,
    CREATE ANY CLUSTER,
    DROP ANY INDEX,
    CREATE SYNONYM,
    CREATE ANY SYNONYM,
    CREATE PUBLIC SYNONYM,
    CREATE VIEW,
    DROP ANY ROLE,
    GRANT ANY ROLE,
    FORCE TRANSACTION,
    CREATE ANY TRIGGER,
    ALTER ANY TRIGGER,
    DROP PROFILE,
    CREATE ANY MATERIALIZED VIEW,
    DROP ANY TYPE,
    EXECUTE ANY TYPE,
    UNDER ANY TYPE,
    CREATE ANY INDEXTYPE,
    UNDER ANY TABLE,
    GRANT ANY OBJECT PRIVILEGE,
    CREATE ANY EVALUATION CONTEXT,
    CREATE ANY RULE,
    ADMINISTER SQL TUNING SET,
    ADMINISTER ANY SQL TUNING SET,
    CREATE ANY EDITION,
    DELETE ANY CUBE DIMENSION,
    CREATE ANY CUBE,
    DROP ANY CUBE,
    INSERT ANY MEASURE FOLDER,
    ALTER SYSTEM,
    ALTER SESSION,
    LOCK ANY TABLE,
    DROP ANY SYNONYM,
    CREATE ANY SEQUENCE,
    SELECT ANY SEQUENCE,
    CREATE PUBLIC DATABASE LINK,
    AUDIT ANY,
    CREATE ANY PROCEDURE,
    DROP ANY PROCEDURE,
    CREATE ANY TYPE,
    ON COMMIT REFRESH,
    FLASHBACK ANY TABLE,
    ALTER ANY EVALUATION CONTEXT,
    CREATE ANY RULE SET,
    ALTER ANY RULE SET,
    SELECT ANY TRANSACTION,
    CREATE MINING MODEL,
    ALTER ANY CUBE DIMENSION,
    CREATE CUBE,
    ALTER ANY CUBE,
    AUDIT SYSTEM,
    MANAGE TABLESPACE,
    SELECT ANY TABLE,
    UPDATE ANY TABLE,
    ALTER ANY CLUSTER,
    DROP ANY SEQUENCE,
    CREATE ANY LIBRARY,
    DROP ANY LIBRARY,
    CREATE ANY OPERATOR,
    DROP ANY DIMENSION,
    CREATE ANY CONTEXT,
    CREATE RULE SET,
    DROP ANY RULE SET,
    CREATE RULE,
    CREATE ANY JOB,
    READ ANY FILE GROUP,
    DROP ANY ASSEMBLY,
    COMMENT ANY MINING MODEL,
    CREATE ANY MEASURE FOLDER,
    UPDATE ANY CUBE DIMENSION,
    CREATE TABLE,
    DROP ANY TABLE,
    DROP PUBLIC SYNONYM,
    ALTER ANY SEQUENCE,
    CREATE PROCEDURE,
    EXECUTE ANY PROCEDURE,
    CREATE TRIGGER,
    DROP ANY TRIGGER,
    CREATE PROFILE,
    ALTER RESOURCE COST,
    ANALYZE ANY,
    ALTER ANY MATERIALIZED VIEW,
    ALTER ANY OPERATOR,
    DROP ANY OPERATOR,
    MERGE ANY VIEW,
    CREATE EVALUATION CONTEXT, advisor,
    CREATE ANY MINING MODEL,
    CREATE TABLESPACE,
    CREATE USER,
    ALTER ROLLBACK SEGMENT,
    ALTER ANY TABLE,
    BACKUP ANY TABLE,
    CREATE CLUSTER,
    CREATE ANY INDEX,
    ALTER ANY INDEX,
    CREATE ANY DIRECTORY,
    EXECUTE ANY LIBRARY,
    CREATE OPERATOR,
    GLOBAL QUERY REWRITE,
    CREATE DIMENSION,
    ALTER ANY OUTLINE,
    ADMINISTER RESOURCE MANAGER,
    DEBUG CONNECT SESSION,
    DROP ANY RULE,
    CREATE JOB,
    MANAGE ANY FILE GROUP,
    DROP ANY EDITION,
    CREATE ANY ASSEMBLY,
    EXECUTE ANY ASSEMBLY,
    DROP ANY MINING MODEL,
    SELECT ANY MINING MODEL,
    SELECT ANY CUBE DIMENSION,
    SELECT ANY CUBE,
    UPDATE ANY CUBE,
    FLASHBACK ARCHIVE ADMINISTER
TO MediCore;

-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE MediCore.appointment (
    appointment_id   NUMBER NOT NULL,
    patient_id       NUMBER NOT NULL,
    doctor_id        NUMBER NOT NULL,
    appointment_date DATE NOT NULL,
    booking_date     DATE DEFAULT sysdate,
    status           VARCHAR2(20 BYTE) DEFAULT 'Pending',
    queue_number     NUMBER DEFAULT 0
)
TABLESPACE system
LOGGING;

CREATE UNIQUE INDEX MediCore.appointment_pk ON
    MediCore.appointment (
        appointment_id
    ASC )
        TABLESPACE system LOGGING;

ALTER TABLE MediCore.appointment
    ADD CONSTRAINT appointment_pk PRIMARY KEY ( appointment_id )
        USING INDEX MediCore.appointment_pk;

CREATE TABLE MediCore.department (
    department_id   NUMBER NOT NULL,
    department_name VARCHAR2(100 BYTE) NOT NULL,
    department_head VARCHAR2(100 BYTE)
)
TABLESPACE system
LOGGING;

CREATE UNIQUE INDEX MediCore.department_department_name_un ON
    MediCore.department (
        department_name
    ASC )
        TABLESPACE system LOGGING;

CREATE UNIQUE INDEX MediCore.department_pk ON
    MediCore.department (
        department_id
    ASC )
        TABLESPACE system LOGGING;

ALTER TABLE MediCore.department
    ADD CONSTRAINT department_pk PRIMARY KEY ( department_id )
        USING INDEX MediCore.department_pk;

ALTER TABLE MediCore.department
    ADD CONSTRAINT department_department_name_un UNIQUE ( department_name )
        USING INDEX MediCore.department_department_name_un;

CREATE TABLE MediCore.doctor (
    doctor_id        NUMBER NOT NULL,
    department_id    NUMBER,
    name             VARCHAR2(100 BYTE) NOT NULL,
    gender           VARCHAR2(10 BYTE),
    date_of_birth    DATE,
    specialization   VARCHAR2(100 BYTE),
    qualification    VARCHAR2(100 BYTE),
    phone            VARCHAR2(20 BYTE) NOT NULL,
    email            VARCHAR2(100 BYTE) NOT NULL,
    consultation_fee NUMBER(10, 2) NOT NULL,
    joining_date     DATE DEFAULT sysdate,
    status           VARCHAR2(20 BYTE) DEFAULT 'Active'
)
TABLESPACE system
LOGGING;

CREATE UNIQUE INDEX MediCore.doctor_email_un ON
    MediCore.doctor (
        email
    ASC )
        TABLESPACE system LOGGING;

CREATE UNIQUE INDEX MediCore.doctor_phone_un ON
    MediCore.doctor (
        phone
    ASC )
        TABLESPACE system LOGGING;

CREATE UNIQUE INDEX MediCore.doctor_pk ON
    MediCore.doctor (
        doctor_id
    ASC )
        TABLESPACE system LOGGING;

ALTER TABLE MediCore.doctor
    ADD CONSTRAINT doctor_pk PRIMARY KEY ( doctor_id )
        USING INDEX MediCore.doctor_pk;

ALTER TABLE MediCore.doctor
    ADD CONSTRAINT doctor_phone_un UNIQUE ( phone )
        USING INDEX MediCore.doctor_phone_un;

ALTER TABLE MediCore.doctor
    ADD CONSTRAINT doctor_email_un UNIQUE ( email )
        USING INDEX MediCore.doctor_email_un;

CREATE TABLE MediCore.financial_ledger (
    ledger_id        NUMBER NOT NULL,
    transaction_type VARCHAR2(50 BYTE) NOT NULL,
    reference_id     NUMBER NOT NULL,
    patient_id       NUMBER NOT NULL,
    doctor_id        NUMBER,
    total_amount     NUMBER(10, 2) NOT NULL,
    doctor_amount    NUMBER(10, 2) NOT NULL,
    admin_amount     NUMBER(10, 2) NOT NULL,
    transaction_date DATE DEFAULT sysdate,
    is_cleared       VARCHAR2(1 BYTE) DEFAULT 'N'
)
TABLESPACE system
LOGGING;

CREATE UNIQUE INDEX MediCore.financial_ledger_pk ON
    MediCore.financial_ledger (
        ledger_id
    ASC )
        TABLESPACE system LOGGING;

ALTER TABLE MediCore.financial_ledger
    ADD CONSTRAINT financial_ledger_pk PRIMARY KEY ( ledger_id )
        USING INDEX MediCore.financial_ledger_pk;

CREATE TABLE MediCore.lab_test (
    test_id     NUMBER NOT NULL,
    test_name   VARCHAR2(100 BYTE) NOT NULL,
    description VARCHAR2(255 BYTE),
    test_fee    NUMBER(10, 2) NOT NULL,
    status      VARCHAR2(20 BYTE) DEFAULT 'Available'
)
TABLESPACE system
LOGGING;

CREATE UNIQUE INDEX MediCore.lab_test_pk ON
    MediCore.lab_test (
        test_id
    ASC )
        TABLESPACE system LOGGING;

ALTER TABLE MediCore.lab_test
    ADD CONSTRAINT lab_test_pk PRIMARY KEY ( test_id )
        USING INDEX MediCore.lab_test_pk;

CREATE TABLE MediCore.lab_test_record (
    record_id        NUMBER NOT NULL,
    patient_id       NUMBER NOT NULL,
    doctor_id        NUMBER NOT NULL,
    test_id          NUMBER NOT NULL,
    order_date       DATE DEFAULT sysdate,
    result_details   CLOB,
    report_date      DATE,
    status           VARCHAR2(20 BYTE) DEFAULT 'Pending',
    waive_commission VARCHAR2(1 BYTE) DEFAULT 'N',
    payment_status   VARCHAR2(20 BYTE) DEFAULT 'Unpaid'
)
TABLESPACE system
LOGGING
        LOB ( result_details ) STORE AS (
            TABLESPACE system
            STORAGE ( PCTINCREASE 0 MINEXTENTS 1 MAXEXTENTS UNLIMITED FREELISTS 1 BUFFER_POOL DEFAULT )
            CHUNK 8192
            RETENTION
            ENABLE STORAGE IN ROW
            NOCACHE LOGGING
        )
        LOB ( result_details ) STORE AS (
            TABLESPACE system
            STORAGE ( PCTINCREASE 0 MINEXTENTS 1 MAXEXTENTS UNLIMITED FREELISTS 1 BUFFER_POOL DEFAULT )
            CHUNK 8192
            RETENTION
            ENABLE STORAGE IN ROW
            NOCACHE LOGGING
        );

CREATE UNIQUE INDEX MediCore.lab_test_record_pk ON
    MediCore.lab_test_record (
        record_id
    ASC )
        TABLESPACE system LOGGING;

ALTER TABLE MediCore.lab_test_record
    ADD CONSTRAINT lab_test_record_pk PRIMARY KEY ( record_id )
        USING INDEX MediCore.lab_test_record_pk;

CREATE TABLE MediCore.patient (
    patient_id        NUMBER NOT NULL,
    name              VARCHAR2(100 BYTE) NOT NULL,
    gender            VARCHAR2(10 BYTE),
    date_of_birth     DATE,
    blood_group       VARCHAR2(5 BYTE),
    phone             VARCHAR2(20 BYTE) NOT NULL,
    email             VARCHAR2(100 BYTE),
    address           VARCHAR2(255 BYTE),
    emergency_contact VARCHAR2(20 BYTE),
    registration_date DATE DEFAULT sysdate,
    status            VARCHAR2(20 BYTE) DEFAULT 'Active'
)
TABLESPACE system
LOGGING;

CREATE UNIQUE INDEX MediCore.patient_phone_un ON
    MediCore.patient (
        phone
    ASC )
        TABLESPACE system LOGGING;

CREATE UNIQUE INDEX MediCore.patient_pk ON
    MediCore.patient (
        patient_id
    ASC )
        TABLESPACE system LOGGING;

ALTER TABLE MediCore.patient
    ADD CONSTRAINT patient_pk PRIMARY KEY ( patient_id )
        USING INDEX MediCore.patient_pk;

ALTER TABLE MediCore.patient
    ADD CONSTRAINT patient_phone_un UNIQUE ( phone )
        USING INDEX MediCore.patient_phone_un;

CREATE TABLE MediCore.prescription (
    prescription_id   NUMBER NOT NULL,
    appointment_id    NUMBER NOT NULL,
    patient_id        NUMBER NOT NULL,
    doctor_id         NUMBER NOT NULL,
    prescription_date DATE DEFAULT sysdate,
    diagnosis         VARCHAR2(255 BYTE),
    medicines         CLOB,
    notes             CLOB
)
TABLESPACE system
LOGGING
        LOB ( medicines ) STORE AS (
            TABLESPACE system
            STORAGE ( PCTINCREASE 0 MINEXTENTS 1 MAXEXTENTS UNLIMITED FREELISTS 1 BUFFER_POOL DEFAULT )
            CHUNK 8192
            RETENTION
            ENABLE STORAGE IN ROW
            NOCACHE LOGGING
        )
        LOB ( notes ) STORE AS (
            TABLESPACE system
            STORAGE ( PCTINCREASE 0 MINEXTENTS 1 MAXEXTENTS UNLIMITED FREELISTS 1 BUFFER_POOL DEFAULT )
            CHUNK 8192
            RETENTION
            ENABLE STORAGE IN ROW
            NOCACHE LOGGING
        )
        LOB ( medicines ) STORE AS (
            TABLESPACE system
            STORAGE ( PCTINCREASE 0 MINEXTENTS 1 MAXEXTENTS UNLIMITED FREELISTS 1 BUFFER_POOL DEFAULT )
            CHUNK 8192
            RETENTION
            ENABLE STORAGE IN ROW
            NOCACHE LOGGING
        )
        LOB ( notes ) STORE AS (
            TABLESPACE system
            STORAGE ( PCTINCREASE 0 MINEXTENTS 1 MAXEXTENTS UNLIMITED FREELISTS 1 BUFFER_POOL DEFAULT )
            CHUNK 8192
            RETENTION
            ENABLE STORAGE IN ROW
            NOCACHE LOGGING
        );

CREATE UNIQUE INDEX MediCore.prescription_pk ON
    MediCore.prescription (
        prescription_id
    ASC )
        TABLESPACE system LOGGING;

ALTER TABLE MediCore.prescription
    ADD CONSTRAINT prescription_pk PRIMARY KEY ( prescription_id )
        USING INDEX MediCore.prescription_pk;

CREATE TABLE MediCore.user_account (
    user_id       NUMBER NOT NULL,
    doctor_id     NUMBER,
    username      VARCHAR2(50 BYTE) NOT NULL,
    password_hash VARCHAR2(255 BYTE) NOT NULL,
    role          VARCHAR2(20 BYTE) NOT NULL,
    status        VARCHAR2(20 BYTE) DEFAULT 'Active',
    created_date  DATE DEFAULT sysdate,
    patient_id    NUMBER
)
TABLESPACE system
LOGGING;

CREATE UNIQUE INDEX MediCore.user_account_pk ON
    MediCore.user_account (
        user_id
    ASC )
        TABLESPACE system LOGGING;

CREATE UNIQUE INDEX MediCore.user_account_username_un ON
    MediCore.user_account (
        username
    ASC )
        TABLESPACE system LOGGING;

ALTER TABLE MediCore.user_account
    ADD CONSTRAINT user_account_pk PRIMARY KEY ( user_id )
        USING INDEX MediCore.user_account_pk;

ALTER TABLE MediCore.user_account
    ADD CONSTRAINT user_account_username_un UNIQUE ( username )
        USING INDEX MediCore.user_account_username_un;

ALTER TABLE MediCore.appointment
    ADD CONSTRAINT fk_apt_doc
        FOREIGN KEY ( doctor_id )
            REFERENCES MediCore.doctor ( doctor_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.appointment
    ADD CONSTRAINT fk_apt_pat
        FOREIGN KEY ( patient_id )
            REFERENCES MediCore.patient ( patient_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.doctor
    ADD CONSTRAINT fk_doc_dept
        FOREIGN KEY ( department_id )
            REFERENCES MediCore.department ( department_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.financial_ledger
    ADD CONSTRAINT fk_ledger_doc
        FOREIGN KEY ( doctor_id )
            REFERENCES MediCore.doctor ( doctor_id )
                ON DELETE SET NULL
            NOT DEFERRABLE;

ALTER TABLE MediCore.financial_ledger
    ADD CONSTRAINT fk_ledger_pat
        FOREIGN KEY ( patient_id )
            REFERENCES MediCore.patient ( patient_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.lab_test_record
    ADD CONSTRAINT fk_ltr_doc
        FOREIGN KEY ( doctor_id )
            REFERENCES MediCore.doctor ( doctor_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.lab_test_record
    ADD CONSTRAINT fk_ltr_pat
        FOREIGN KEY ( patient_id )
            REFERENCES MediCore.patient ( patient_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.lab_test_record
    ADD CONSTRAINT fk_ltr_tst
        FOREIGN KEY ( test_id )
            REFERENCES MediCore.lab_test ( test_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.prescription
    ADD CONSTRAINT fk_prs_apt
        FOREIGN KEY ( appointment_id )
            REFERENCES MediCore.appointment ( appointment_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.prescription
    ADD CONSTRAINT fk_prs_doc
        FOREIGN KEY ( doctor_id )
            REFERENCES MediCore.doctor ( doctor_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.prescription
    ADD CONSTRAINT fk_prs_pat
        FOREIGN KEY ( patient_id )
            REFERENCES MediCore.patient ( patient_id )
            NOT DEFERRABLE;

ALTER TABLE MediCore.user_account
    ADD CONSTRAINT fk_usr_doc
        FOREIGN KEY ( doctor_id )
            REFERENCES MediCore.doctor ( doctor_id )
                ON DELETE SET NULL
            NOT DEFERRABLE;

ALTER TABLE MediCore.user_account
    ADD CONSTRAINT fk_usr_pat
        FOREIGN KEY ( patient_id )
            REFERENCES MediCore.patient ( patient_id )
                ON DELETE SET NULL
            NOT DEFERRABLE;

CREATE SEQUENCE MediCore.apt_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER MediCore.trg_apt_id BEFORE
    INSERT ON MediCore.appointment
    FOR EACH ROW
    WHEN ( new.appointment_id IS NULL )
BEGIN
    :new.appointment_id := MediCore.apt_seq.nextval;
END;
/

CREATE SEQUENCE MediCore.dept_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER MediCore.trg_dept_id BEFORE
    INSERT ON MediCore.department
    FOR EACH ROW
    WHEN ( new.department_id IS NULL )
BEGIN
    :new.department_id := MediCore.dept_seq.nextval;
END;
/

CREATE SEQUENCE MediCore.doc_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER MediCore.trg_doc_id BEFORE
    INSERT ON MediCore.doctor
    FOR EACH ROW
    WHEN ( new.doctor_id IS NULL )
BEGIN
    :new.doctor_id := MediCore.doc_seq.nextval;
END;
/

CREATE SEQUENCE MediCore.ledger_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER MediCore.trg_ledger_id BEFORE
    INSERT ON MediCore.financial_ledger
    FOR EACH ROW
    WHEN ( new.ledger_id IS NULL )
BEGIN
    :new.ledger_id := MediCore.ledger_seq.nextval;
END;
/

CREATE SEQUENCE MediCore.lab_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER MediCore.trg_lab_id BEFORE
    INSERT ON MediCore.lab_test
    FOR EACH ROW
    WHEN ( new.test_id IS NULL )
BEGIN
    :new.test_id := MediCore.lab_seq.nextval;
END;
/

CREATE SEQUENCE MediCore.ltr_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER MediCore.trg_ltr_id BEFORE
    INSERT ON MediCore.lab_test_record
    FOR EACH ROW
    WHEN ( new.record_id IS NULL )
BEGIN
    :new.record_id := MediCore.ltr_seq.nextval;
END;
/

CREATE SEQUENCE MediCore.pat_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER MediCore.trg_pat_id BEFORE
    INSERT ON MediCore.patient
    FOR EACH ROW
    WHEN ( new.patient_id IS NULL )
BEGIN
    :new.patient_id := MediCore.pat_seq.nextval;
END;
/

CREATE SEQUENCE MediCore.prs_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER MediCore.trg_prs_id BEFORE
    INSERT ON MediCore.prescription
    FOR EACH ROW
    WHEN ( new.prescription_id IS NULL )
BEGIN
    :new.prescription_id := MediCore.prs_seq.nextval;
END;
/

CREATE SEQUENCE MediCore.usr_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER MediCore.trg_usr_id BEFORE
    INSERT ON MediCore.user_account
    FOR EACH ROW
    WHEN ( new.user_id IS NULL )
BEGIN
    :new.user_id := MediCore.usr_seq.nextval;
END;
/



-- Oracle SQL Developer Data Modeler Summary Report: 
-- 
-- CREATE TABLE                             9
-- CREATE INDEX                            14
-- ALTER TABLE                             27
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           9
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          9
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              1
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   0
-- WARNINGS                                 0
