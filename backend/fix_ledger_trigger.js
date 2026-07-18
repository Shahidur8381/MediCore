const { initialize, executeQuery, getConnection } = require('./config/db');

async function fixTrigger() {
    let connection;
    try {
        await initialize();
        connection = await getConnection();
        
        try {
            await connection.execute(`DROP TRIGGER medicore.trg_ledger_id`);
            console.log("Trigger dropped.");
        } catch(e) {
            console.log("Trigger drop error:", e.message);
        }

        const triggerSQL = `
CREATE OR REPLACE TRIGGER medicore.trg_ledger_id BEFORE
    INSERT ON medicore.financial_ledger
    FOR EACH ROW
    WHEN ( new.ledger_id IS NULL )
BEGIN
    :new.ledger_id := medicore.ledger_seq.nextval;
END;
`;
        await connection.execute(triggerSQL);
        console.log("Trigger created successfully.");
        
    } catch(err) {
        console.error("Error:", err.message);
    } finally {
        if(connection) {
            try { await connection.close(); } catch(e){}
        }
        process.exit(0);
    }
}

fixTrigger();
