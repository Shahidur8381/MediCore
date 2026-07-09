const { initialize, executeQuery } = require('./config/db'); 
async function run() { 
    try {
        await initialize(); 
        await executeQuery(`CREATE OR REPLACE TRIGGER medicore.trg_ledger_id BEFORE INSERT ON medicore.financial_ledger FOR EACH ROW WHEN (new.ledger_id IS NULL) BEGIN :new.ledger_id := medicore.ledger_seq.nextval; END;`); 
        console.log('Trigger Created');
        
        // Also add the lab_test_record payment_status alter statement since it failed due to split?
        // Wait, the output said "Error (might already exist): ORA-00900: invalid SQL statement" for the trigger body.
        // It executed "ALTER TABLE medicore.lab_test_record ADD waive..." successfully.
        
        process.exit(0); 
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
} 
run();
