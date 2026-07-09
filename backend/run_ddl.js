const fs = require('fs');
const path = require('path');
const { initialize, executeQuery } = require('./config/db');

async function runDDL() {
    try {
        await initialize();
        console.log("Connected to database");

        const sql = fs.readFileSync(path.join(__dirname, '../database/payments_ddl.sql'), 'utf8');
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('/'));

        for (const statement of statements) {
            let cleanStmt = statement;
            if (cleanStmt.endsWith('/')) {
                cleanStmt = cleanStmt.substring(0, cleanStmt.length - 1).trim();
            }
            if (cleanStmt.length > 0) {
                console.log('Executing:', cleanStmt.substring(0, 50) + '...');
                try {
                    await executeQuery(cleanStmt);
                } catch(e) {
                    console.log('Error (might already exist):', e.message);
                }
            }
        }
        console.log("DDL executed.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

runDDL();
