const { initialize, getConnection } = require('./config/db');

async function addColumn() {
    let connection;
    try {
        await initialize();
        connection = await getConnection();
        await connection.execute("ALTER TABLE medicore.financial_ledger ADD is_cleared VARCHAR2(1 BYTE) DEFAULT 'N'");
        console.log('is_cleared added successfully.');
    } catch(e) {
        console.log(e);
    } finally {
        if(connection) await connection.close();
        process.exit(0);
    }
}
addColumn();
