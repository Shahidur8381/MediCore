const { initialize, executeQuery, getConnection } = require('./config/db');

async function addPaymentStatus() {
    let connection;
    try {
        await initialize();
        connection = await getConnection();
        await connection.execute("ALTER TABLE medicore.lab_test_record ADD payment_status VARCHAR2(20 BYTE) DEFAULT 'Unpaid'");
        console.log('payment_status added successfully.');
    } catch(e) {
        console.log(e);
    } finally {
        if(connection) await connection.close();
        process.exit(0);
    }
}
addPaymentStatus();
