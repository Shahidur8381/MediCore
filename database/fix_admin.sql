-- Disable substitution variable parsing ($ is used in bcrypt hashes)
SET DEFINE OFF

UPDATE USER_ACCOUNT 
SET Password_Hash = '$2b$10$SF6UYB7KHiPMi9uvAfHe1.EmnxAsr0GawydKOkB9OCMIXxa3wxsUq' 
WHERE Username = 'admin';

COMMIT;


SELECT Username, Password_Hash, Role, Status FROM USER_ACCOUNT WHERE Username = 'admin';
